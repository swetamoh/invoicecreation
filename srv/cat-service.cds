using my.bookshop as my from '../db/data-model';

service CatalogService {
    entity GetPendingInvoiceList as projection on my.GetPendingInvoiceList;
    entity GetPoDetailstoCreateInvoice as projection on my.GetPoDetailstoCreateInvoice;
    entity GetAccountDetailsagainstMrn as projection on my.GetAccountDetailsagainstMrn;
    action PostBillPassing(invoiceData: String) returns String;
    action PostVoucher(invoiceData: String) returns String;
}
