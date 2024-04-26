const cds = require('@sap/cds');
const axios = require('axios');

module.exports = (srv) => {

    const { GetPendingInvoiceList, GetPoDetailstoCreateInvoice, GetAccountDetailsagainstMrnforBillPassing, GetMRNAccountDetailsforVoucherGeneration } = srv.entities;

    srv.on('READ', GetPendingInvoiceList, async (req) => {
        const params = req._queryOptions;
        const loginid = req.headers.loginid;
        const results = await getPendingInvoiceList(params,loginid);
        if (results.error) req.reject(500, results.error);
        return results

    });

    srv.on('READ', GetPoDetailstoCreateInvoice, async (req) => {
        const { UnitCode, PoNum, MRNnumber, AddressCode } = req._queryOptions;
        const loginid = req.headers.loginid;
        const results = await getPoDetailstoCreateInvoice(UnitCode, PoNum, MRNnumber, AddressCode,loginid);
        if (results.error) req.reject(500, results.error);

        const expandDocumentRows = req.query.SELECT.columns && req.query.SELECT.columns.some(({ expand, ref }) => expand && ref[0] === "DocumentRows");
        if (expandDocumentRows) {
            results.poDetailstoCreateInvoice.forEach(po => {
                po.DocumentRows = results.documentRows.filter(dr => dr.PNum_PONumber === po.PONumber);
            });
        }

        return results.poDetailstoCreateInvoice;
    });

    srv.on('READ', GetAccountDetailsagainstMrnforBillPassing, async (req) => {
        const { UnitCode, MRNnumber } = req._queryOptions;
        const loginid = req.headers.loginid;
        //const UnitCode = 'P01'
        //const MRNnumber = '22/01GEFP1/02004'
        const results = await getAccountDetailsagainstMrnforBillPassing(UnitCode, MRNnumber,loginid);
        if (results.error) req.reject(500, results.error);
        return results
    });

    srv.on('PostBillPassing', async (req) => {
        const asnDataString = req.data.invoiceData;
        const asnDataParsed = JSON.parse(asnDataString);
        const asnDataFormatted = JSON.stringify(asnDataParsed, null, 2);
        const loginid = req.headers.loginid;
        try {
            const response = await postBillPassing(asnDataFormatted,loginid);
            return response;
        } catch (error) {
            console.error('Error in PostBillPassing API call:', error);
            req.reject(400, `Error Bill posting : ${error.message}`);
            // throw new Error(`Error Bill posting : ${error.message}`);
        }
    });

    srv.on('VoucherGen', async (req) => {
        const asnDataString = req.data.invoiceData;
        const asnDataParsed = JSON.parse(asnDataString);
        const asnDataFormatted = JSON.stringify(asnDataParsed, null, 2);
        const loginid = req.headers.loginid;
        try {
            const response = await voucherGen(asnDataFormatted,loginid);
            return response;
        } catch (error) {
            console.error('Error in VoucherGen API call:', error);
            req.reject(400, `Error Voucher generation : ${error.message}`);
            //throw new Error(`Error Voucher generation : ${error.message}`);
        }
    });

    srv.on('PostVoucher', async (req) => {
        const asnDataString = req.data.invoiceData;
        const asnDataParsed = JSON.parse(asnDataString);
        const asnDataFormatted = JSON.stringify(asnDataParsed, null, 2);
        const loginid = req.headers.loginid;
        try {
            const response = await postVoucher(asnDataFormatted,loginid);
            return response;
        } catch (error) {
            console.error('Error in PostVoucher API call:', error);
            req.reject(400, `Error Voucher posting : ${error.message}`);
            //throw new Error(`Error Voucher posting : ${error.message}`);
        }
    });

    srv.on('READ', GetMRNAccountDetailsforVoucherGeneration, async (req) => {
        const { UnitCode, MRNNumber, MRNDate } = req._queryOptions;
        const loginid = req.headers.loginid;
        const results = await getMRNAccountDetailsforVoucherGeneration(UnitCode, MRNNumber, MRNDate,loginid);
        if (results.error) req.reject(500, results.error);
        return results
    });
};

async function getPendingInvoiceList(params,loginid) {
    try {
        const {
            UnitCode, PoNum, MrnNumber, FromPOdate, ToPOdate,
            FromMrndate, ToMrndate, Status
        } = params;

        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetPendingInvoiceList?RequestBy='${loginid}'&UnitCode='${UnitCode}'&PoNum='${PoNum}'&MrnNumber='${MrnNumber}'&FromPOdate='${FromPOdate}'&ToPOdate='${ToPOdate}'&FromMrndate='${FromMrndate}'&ToMrndate='${ToMrndate}'&Status='${Status}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        if (response.d) {
            return JSON.parse(response.d);
        } else {
            return {
                error: response.ErrorDescription
            }
        }
    } catch (error) {
        console.error('Error in get Pending Invoice List API call:', error);
        throw new Error(error);
    }
}

async function getPoDetailstoCreateInvoice(UnitCode, PoNum, MRNnumber, AddressCode, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetPoDetailstoCreateInvoice?RequestBy='${loginid}'&UnitCode='${UnitCode}'&PoNum='${PoNum}'&MRNnumber='${MRNnumber}'&AddressCode='${AddressCode}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {}
            });

        if (response.d) {
            const dataArray = JSON.parse(response.d);

            const poDetailstoCreateInvoice = dataArray.map(data => {
                return {
                    PONumber: data.PONumber,
                    PODate: data.PODate,
                    VendorCode: data.VendorCode,
                    VendorName: data.VendorName,
                    VendorAddress: data.VendorAddress,
                    VendorPhoneNumber: data.VendorPhoneNumber,
                    VendorEMail: data.VendorEMail,
                    VendorGstNumber: data.VendorGstNumber,
                    VendorPanNumber: data.VendorPanNumber,
                    VendorMSMEIndiactor: data.VendorMSMEIndiactor,
                    MRNnumber: data.MRNnumber,
                    MRNDate: data.MRNDate,
                    MRNCreatedBy: data.MRNCreatedBy,
                    MRNDeliveryLocation: data.MRNDeliveryLocation,
                    TotalMRNAmountAsperPO: data.TotalMRNAmountAsperPO,
                    TotalMRNQuantity: data.TotalMRNQuantity,
                };
            });

            // Extracting DocumentRows details
            const documentRows = dataArray.flatMap(data =>
                data.DocumentRows.map(row => {
                    return {
                        UnitCode: row.UnitCode,
                        TRNCode: row.TRNCode,
                        MRNNumber: row.MRNNumber,
                        MRNLineNumber: row.MRNLineNumber,
                        MaterialCode: row.MaterialCode,
                        MaterialDescription: row.MaterialDescription,
                        ItemNumber: row.ItemNumber,
                        ItemGroupCode: row.ItemGroupCode,
                        GroupAccountCode: row.GroupAccountCode,
                        GroupAccountDescription: row.GroupAccountDescription,
                        ItemRate: row.ItemRate,
                        ItemUOM: row.ItemUOM,
                        AcceptedQty: row.AcceptedQty,
                        RejectedQty: row.RejectedQty,
                        ActualQty: row.ActualQty,
                        InvoiceQty: row.InvoiceQty,
                        TRNLineNumber: row.TRNLineNumber,
                        TRNType: row.TRNType,
                        HSNCode: row.HSNCode,
                        MaterialValue: row.MaterialValue,
                        IGP: row.IGP,
                        CGP: row.CGP,
                        SGP: row.SGP,
                        CDT: row.CDT,
                        CRT: row.CRT,
                        IGA: row.IGA,
                        CGA: row.CGA,
                        SGA: row.SGA,
                        Packing: row.Packing,
                        Freight: row.Freight,
                        Others: row.Others,
                        ExchangeRate: row.ExchangeRate,
                        FrieghtOrg: row.FrieghtOrg,
                        OtherOrg: row.OtherOrg,
                        PakingOrg: row.PakingOrg,
                        FRMyear: row.FRMyear,
                        TCS: row.TCS,
                        InvoiceRate: row.InvoiceRate,
                        CurrPORate: row.CurrPORate,
                        CurrencyCode: row.CurrencyCode,
                        TaxPercentage: row.TaxPercentage,
                        Tax: row.Tax,
                        MRNLineValue: row.MRNLineValue,
                        POLineValue: row.POLineValue,
                        InvoiceStatus: row.InvoiceStatus,
                        BatchNumber: row.BatchNumber,
                        ShortQuantity: "",
                        PNum_PONumber: data.PONumber  // associating with the current GetPoDetailstoCreateInvoice
                    };
                })
            );

            return {
                poDetailstoCreateInvoice: poDetailstoCreateInvoice,
                documentRows: documentRows
            };
        }
    } catch (error) {
        console.error('Error in get Pending Invoice List API call:', error);
        throw new Error(error);
    }
}

async function getAccountDetailsagainstMrnforBillPassing(UnitCode, MRNnumber, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `GET GetAccountDetailsagainstMrnforBillPassing?RequestBy='${loginid}'&UnitCode='${UnitCode}'&MRNnumber='${MRNnumber}'`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

        if (response.d) {
            return JSON.parse(response.d);
        } else {
            return {
                error: response.ErrorDescription
            }
        }
    } catch (error) {
        console.error('Error in GetAccountDetailsagainstMrn API call:', error);
        throw new Error('Unable to fetch GetAccountDetailsagainstMrn List:', error);
    }
}

async function postBillPassing(invoiceData, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `POST PostBillPassing`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: invoiceData
            });

        if (response.SuccessCode) {
            return 'Bill posted successfully';
        } else {
            throw new Error(response.ErrorDescription || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error in Bill Passing:', error);
        throw error;
    }
}

async function voucherGen(invoiceData, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
                query: `POST PostVoucherGeneration`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: invoiceData
            });

        if (response.SuccessCode) {
            return 'Voucher generated successfully';
        } else {
            throw new Error(response.ErrorDescription || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error in Voucher Generation:', error);
        throw error;
    }
}

async function postVoucher(invoiceData, loginid) {
    try {
        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
            query: `POST PostVoucherPosting`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: invoiceData
        });

        if (response.SuccessCode) {
            return 'Voucher posted successfully';
        } else {
            throw new Error(response.ErrorDescription || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error in Voucher Passing:', error);
        throw error;
    }
}

async function getMRNAccountDetailsforVoucherGeneration(UnitCode, MRNNumber, MRNDate, loginid) {
    try {
        const token = await generateToken(loginid),
        legApi = await cds.connect.to('Legacy'),
        response = await legApi.send({
        query: `GET GetMRNAccountDetailsforVoucherGeneration?RequestBy='${loginid}'&UnitCode='${UnitCode}'&MRNNumber='${MRNNumber}'&MRNDate='${MRNDate}'`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.d) {
            return JSON.parse(response.d);
        } else {
            return {
                error: response.ErrorDescription
            }
        }
    } catch (error) {
        console.error('Error in GetMRNAccountDetails API call:', error);
        throw new Error('Unable to fetch GetMRNAccountDetails List:', error);
    }
}
async function generateToken(username) {
    try {
        const legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
            query: `POST GenerateToken`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "InputKey": username
            }
        });

        if (response.d) {
            return response.d;
        } else {
            console.error('Error parsing token response:', response.data);
            throw new Error('Error parsing the token response from the API.');
        }
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Unable to generate token.');
    }
}