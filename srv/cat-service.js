const cds = require('@sap/cds');
const axios = require('axios');

module.exports = (srv) => {

    const { GetPendingInvoiceList, GetPoDetailstoCreateInvoice } = srv.entities;

    srv.on('READ', GetPendingInvoiceList, async (req) => {
        const params = req._queryOptions;
        const results = await getPendingInvoiceList(params);
        if (!results) throw new Error('Unable to fetch Pending Invoice List.');
        return results

    });

    srv.on('READ', GetPoDetailstoCreateInvoice, async (req) => {
        const { UnitCode, PoNum, MRNnumber, AddressCode } = req._queryOptions
        const results = await getPoDetailstoCreateInvoice(UnitCode, PoNum, MRNnumber, AddressCode);
        if (!results) throw new Error('Unable to fetch PoDetailstoCreateInvoice.');

        const expandDocumentRows = req.query.SELECT.columns && req.query.SELECT.columns.some(({ expand, ref }) => expand && ref[0] === "DocumentRows");
        if (expandDocumentRows) {
            results.poDetailstoCreateInvoice.forEach(po => {
                po.DocumentRows = results.documentRows.filter(dr => dr.PNum_PONumber === po.PONumber);
            });
        }

        return results.poDetailstoCreateInvoice;
    });


};

async function getPendingInvoiceList(params) {
    try {
        const {
            UnitCode, PoNum, MrnNumber, FromPOdate, ToPOdate,
            FromMrndate, ToMrndate, Status
        } = params;

        const url = `https://imperialauto.co:84/IAIAPI.asmx/GetPendingInvoiceList?RequestBy='Manikandan'&UnitCode='${UnitCode}'&PoNum='${PoNum}'&MrnNumber='${MrnNumber}'&FromPOdate='${FromPOdate}'&ToPOdate='${ToPOdate}'&FromMrndate='${FromMrndate}'&ToMrndate='${ToMrndate}'&Status='${Status}'`;


        const response = await axios({
            method: 'get',
            url: url,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.data && response.data.d) {
            return JSON.parse(response.data.d);
        } else {
            console.error('Error parsing response:', response.data);
            throw new Error('Error parsing the response from the API.');
        }
    } catch (error) {
        console.error('Error in get Pending Invoice List API call:', error);
        throw new Error('Unable to fetch Pending Invoice List.');
    }
}

async function getPoDetailstoCreateInvoice(UnitCode, PoNum, MRNnumber, AddressCode) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://imperialauto.co:84/IAIAPI.asmx/GetPoDetailstoCreateInvoice?RequestBy='Manikandan'&UnitCode='${UnitCode}'&PoNum='${PoNum}'&MRNnumber='${MRNnumber}'&AddressCode='${AddressCode}'`,
            headers: {
                'Authorization': 'Bearer IncMpsaotdlKHYyyfGiVDg==',
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.data && response.data.d) {
            const dataArray = JSON.parse(response.data.d);

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
        throw new Error('Unable to fetch Pending Invoice List.');
    }
}