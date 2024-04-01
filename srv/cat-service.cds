using my.invoicecreation as my from '../db/data-model';

service CatalogService {
    entity GetPendingInvoiceList as projection on my.GetPendingInvoiceList;
    entity GetPoDetailstoCreateInvoice as projection on my.GetPoDetailstoCreateInvoice;
    entity GetAccountDetailsagainstMrnforBillPassing as projection on my.GetAccountDetailsagainstMrnforBillPassing;
    action PostBillPassing(invoiceData: String) returns String;
    action PostVoucher(invoiceData: String) returns String;
    action VoucherGen(invoiceData: String) returns String;
    entity GetMRNAccountDetailsforVoucherGeneration as projection on my.GetMRNAccountDetailsforVoucherGeneration;
}
