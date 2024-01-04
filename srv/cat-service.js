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
        const {UnitCode, PoNum, MRNnumber, AddressCode} = req._queryOptions
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
                    PONumber : data.PONumber,
                    PODate  : data.PODate,
                    VendorCode  : data.VendorCode,
                    VendorName: data.VendorName,
                    VendorAddress: data.VendorAddress,
                    VendorPhoneNumber: data.VendorPhoneNumber,
                    VendorEMail: data.VendorEMail,
                    VendorGstNumber: data.VendorGstNumber,
                    VendorPanNumber: data.VendorPanNumber,
                    VendorMSMEIndiactor: data.VendorMSMEIndiactor,
                    MRNnumber: data.MRNnumber,
                    MRNDate: data.MRNDate,
                    MRNDeliveryLocation: data.MRNDeliveryLocation,
                    TotalMRNAmountAsperPO: data.TotalMRNAmountAsperPO,
                    TotalMRNQuantity: data.TotalMRNQuantity,
                };
            });

            // Extracting DocumentRows details
            const documentRows = dataArray.flatMap(data =>
                data.DocumentRows.map(row => {
                    return {
                        ItemNumber: row.ItemNumber,
                        MaterialCode: row.MaterialCode,
                        MaterialDescription: row.MaterialDescription,
                        BatchNumber: row.BatchNumber,
                        QuantityReceived: row.QuantityReceived,
                        UOM: row.UOM,
                        POAmount: row.POAmount,
                        TaxAmount: row.TaxAmount,
                        OtherCharges: row.OtherCharges,
                        FrieghtAmount: row.FrieghtAmount,
                        Packing: row.Packing,
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