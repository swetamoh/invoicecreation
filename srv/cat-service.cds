using my.bookshop as my from '../db/data-model';

service CatalogService {
    entity GetPendingInvoiceList as projection on my.GetPendingInvoiceList;
    entity GetPoDetailstoCreateInvoice as projection on my.GetPoDetailstoCreateInvoice;
}
