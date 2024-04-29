sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.invoicecreation.controller.ASNReportDetail", {

		onInit: function () {
			//this._tableTemp = this.getView().byId("tableTempId").clone();
			this.detailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.detailModel, "detailModel");
			this.accdetailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.accdetailModel, "accdetailModel");
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);
			this.byId("uploadSet").attachEvent("openPressed", this.onOpenPressed, this);
			this.byId("uploadSet").setUploadEnabled(false);
		},

		handleRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "ASNReportDetail") {
				var that = this;
				//this.detailModel.refresh(true);
				sap.ui.core.BusyIndicator.show();
				var oModel = this.getOwnerComponent().getModel();
				var data = oEvent.getParameter("arguments");
				this.UnitCode = data.UnitCode;
				this.PoNum = data.PoNum.replace(/-/g, '/');
				this.PNumAttach = data.PoNum;
				this.MRNnumber = data.MRNnumber.replace(/-/g, '/');
				this.AddressCode = data.AddressCode;
				this.SendToAccDate = data.SendToAccDate.replace(/-/g, '/');
				this.TillDatePurchaseVal = data.TillDatePurchaseVal;
				this.DedTds = data.DedTds;
				this.TotalDebit = data.TotalDebit;
				this.TotalCredit = data.TotalCredit;
				this.VoucherType = data.VoucherType;
				this.AccCode = data.AccCode;
				this.AccDesc = data.AccDesc;
				this.ReceiptDate = data.ReceiptDate.replace(/-/g, '/');
				this.VoucherNumber = data.VoucherNumber.replace(/-/g, '/');
				if (data.ASNNumber) {
					this.ASNNum = data.ASNNumber;
				}
				//this.getView().byId("pageId").setTitle("ASN Number - " + this.AsnNumber);
				var request = "/GetPoDetailstoCreateInvoice";
				oModel.read(request, {
					urlParameters: {
						"$expand": "DocumentRows",
						UnitCode: this.UnitCode,
						PoNum: this.PoNum,
						MRNnumber: this.MRNnumber,
						AddressCode: this.AddressCode
					},
					success: function (oData) {
						sap.ui.core.BusyIndicator.hide();
						var filteredPurchaseOrder = oData.results.find(po => po.PONumber === that.PoNum);
						if (filteredPurchaseOrder) {
							that.detailModel.setData(filteredPurchaseOrder);
							that.detailModel.refresh(true);
							for (var i = 0; i < that.detailModel.getData().DocumentRows.results.length; i++) {
							that.detailModel.getData().DocumentRows.results[i].ActualItemRate = that.detailModel.getData().DocumentRows.results[i].ItemRate;
							that.detailModel.getData().DocumentRows.results[i].ShortQuantity = parseFloat(that.detailModel.getData().DocumentRows.results[i].InvoiceQty) - parseFloat(that.detailModel.getData().DocumentRows.results[i].ActualQty);
							}
							that.detailModel.getData().PVNumber = this.VoucherNumber;
							that.detailModel.refresh(true);
							that.MRNDate = that.detailModel.getData().MRNDate;
							if (that.detailModel.getData().DocumentRows.results[0].InvoiceStatus === 'PENDING FOR BILL PASSING') {
								that.getAccDetailsBill();
							} else if (that.detailModel.getData().DocumentRows.results[0].InvoiceStatus === 'PENDING FOR VOUCHER GENERATION' || that.detailModel.getData().DocumentRows.results[0].InvoiceStatus === 'PENDING FOR VOUCHER POSTING') {
								that.getAccDetailsVoucher();
							}
							if (that.ASNNum) {
								that._fetchFilesForASNNum(that.ASNNum);
							} else {
								that._fetchFilesForPoNum(that.PNumAttach);
							}
						} else {
							MessageBox.error("Data not found");
						}
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
						// MessageBox.error(oError.message);
					}
				});

			}
		},
		_fetchFilesForASNNum: function (AsnNum) {
			var oModel = this.getView().getModel("catalog2");
			var oUploadSet = this.byId("uploadSet");
			oUploadSet.removeAllItems();

			oModel.read("/Files", {
				filters: [new sap.ui.model.Filter("AsnNum", sap.ui.model.FilterOperator.EQ, AsnNum)],
				success: function (oData) {
					oData.results.forEach(function (fileData) {
						var oItem = new sap.m.upload.UploadSetItem({
							fileName: fileData.fileName,
							mediaType: fileData.mediaType,
							url: fileData.url,
							attributes: [
								new sap.m.ObjectAttribute({ title: "Uploaded By", text: fileData.createdBy }),
								new sap.m.ObjectAttribute({ title: "Uploaded on", text: fileData.createdAt }),
								new sap.m.ObjectAttribute({ title: "File Size", text: fileData.size.toString() })
							]
						});

						oItem.setVisibleEdit(false).setVisibleRemove(false);
						oUploadSet.addItem(oItem);
					});
				},
				error: function (oError) {
					console.log("Error: " + oError)
				}
			});
		},
		_fetchFilesForPoNum: function (PNumAttach) {
			var oModel = this.getView().getModel("catalog1");
			var oUploadSet = this.byId("uploadSet");
			oUploadSet.removeAllItems();
			oUploadSet.setUploadEnabled(false);
			oUploadSet.setUploadButtonInvisible(true);
			oModel.read("/Files", {
				filters: [new sap.ui.model.Filter("PNum_PoNum", sap.ui.model.FilterOperator.EQ, PNumAttach)],
				success: function (oData) {
					oData.results.forEach(function (fileData) {
						var oItem = new sap.m.upload.UploadSetItem({
							fileName: fileData.fileName,
							mediaType: fileData.mediaType,
							url: fileData.url,
							attributes: [
								new sap.m.ObjectAttribute({ title: "Uploaded By", text: fileData.createdBy }),
								new sap.m.ObjectAttribute({ title: "Uploaded on", text: fileData.createdAt }),
								new sap.m.ObjectAttribute({ title: "File Size", text: fileData.size.toString() })
							]
						});
						oItem.setVisibleEdit(false).setVisibleRemove(false);
						oUploadSet.addItem(oItem);
					});
				},
				error: function (oError) {
					console.log("Error: " + oError)
				}
			});
		},
		onOpenPressed: function (oEvent) {
			oEvent.preventDefault();
			//var item = oEvent.getSource();
			var item = oEvent.getParameter("item");
			this._fileName = item.getFileName();
			this._download(item)
				.then((blob) => {
					var url = window.URL.createObjectURL(blob);
					var link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', this._fileName);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				})
				.catch((err) => {
					console.log(err);
				});
		},
		_download: function (item) {
			console.log("_download")
			var settings = {
				url: item.getUrl(),
				method: "GET",
				xhrFields: {
					responseType: "blob"
				}
			}

			return new Promise((resolve, reject) => {
				$.ajax(settings)
					.done((result, textStatus, request) => {
						resolve(result);
					})
					.fail((err) => {
						reject(err);
					})
			});
		},
		getAccDetailsBill: function () {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			var request = "/GetAccountDetailsagainstMrnforBillPassing";
			oModel.read(request, {
				urlParameters: {
					UnitCode: this.UnitCode,
					MRNnumber: this.MRNnumber
				},
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.accdetailModel.setData(oData);
					that.accdetailModel.refresh(true);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var value = JSON.parse(oError.response.body);
					MessageBox.error(value.error.message.value);
					// MessageBox.error(oError.message);
				}
			});
		},
		getAccDetailsVoucher: function () {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			this.MRNDate = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM yyyy"
			}).format(new Date(this.MRNDate));
			var request = "/GetMRNAccountDetailsforVoucherGeneration";
			oModel.read(request, {
				urlParameters: {
					UnitCode: this.UnitCode,
					MRNNumber: this.MRNnumber,
					MRNDate: this.MRNDate
				},
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.accdetailModel.setData(oData);
					that.accdetailModel.refresh(true);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var value = JSON.parse(oError.response.body);
					MessageBox.error(value.error.message.value);
					//MessageBox.error(oError.message);
				}
			});
		},
		onNavPress: function () {
			history.go(-1);
		},
		onRateChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].ActualItemRate = val;
			this.detailModel.refresh(true);
		},
		onTaxAmtChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].ActualTaxAmount = val;
			this.detailModel.refresh(true);
		},
		onTotalChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].MRNLineValue = val;
			this.detailModel.refresh(true);
		},
		onCDTChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].CDT = val;
			this.detailModel.refresh(true);
		},
		onCRTChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].CRT = val;
			this.detailModel.refresh(true);
		},
		onTCSChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].TCS = val;
			this.detailModel.refresh(true);
		},
		onRemarksChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].Remarks = val;
			this.detailModel.refresh(true);
		},
		onExchRateChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].ExchangeRate = val;
			this.detailModel.refresh(true);
		},
		onOthChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].Others = val;
			this.detailModel.refresh(true);
		},
		onFreightChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].Freight = val;
			this.detailModel.refresh(true);
		},
		onPackChange: function (e) {
			const val = e.getParameter("newValue"),
				obj = e.getSource().getParent().getBindingContext("detailModel").getObject();
			var path = e.getSource().getParent().getBindingContextPath().split("/")[3];
			var data = this.detailModel.getData().DocumentRows.results;
			data[path].Packing = val;
			this.detailModel.refresh(true);
		},
		onBillBookingPress: function (oEvt) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			this.accdata = this.accdetailModel.getData().results;
			this.data = this.detailModel.getData();
			var form = {
				"UnitCode": this.UnitCode,
				"CreatedBy": this.getOwnerComponent().getModel().getHeaders().loginId,
				"CreatedIP": "",
				"BillPassingAccountDetails": [],
				"BillPassingMaterialDetails": []
			};
			for (var i = 0; i < this.accdata.length; i++) {
				if (this.accdata[i].BillDate) {
					//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
					var date = this.accdata[i].BillDate;
					var DateInstance = new Date(date);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					});
					this.BillDate = dateFormat.format(DateInstance);
					this.BillDate = this.formatdate(this.BillDate);
				}
				if (this.accdata[i].RefDate) {
					//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
					var date = this.accdata[i].RefDate;
					var DateInstance = new Date(date);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					});
					this.RefDate = dateFormat.format(DateInstance);
					this.RefDate = this.formatdate(this.RefDate);
				}
				var row = {
					"Sno": this.accdata[i].Sno,
					"AccountCode": this.accdata[i].AccountCode,
					"AccountDescription": this.accdata[i].AccountDescription,
					"Particulars": this.accdata[i].Particulars,
					"Amount": this.accdata[i].Amount,
					"AccType": this.accdata[i].AccType,
					"DedTds": this.accdata[i].DedTds,
					"TdsAmount": this.accdata[i].TdsAmount,
					"BillNumber": this.accdata[i].BillNumber,
					"BillDate": this.BillDate,
					"BillAmount": this.accdata[i].Billamount,
					"RefVoucherSlNumber": this.accdata[i].RefVoucherSlNumber,
					"OnlineFlag": this.accdata[i].Onlineflag,
					"BalAmount": this.accdata[i].BalAmount,
					"Flag2": this.accdata[i].Flag2,
					"OtherAmount": this.accdata[i].Otheramount,
					"RefNumber": this.accdata[i].RefNumber,
					"RefDate": this.RefDate,
					"CurrVal": this.accdata[i].CurrVal,
					"RefAmount": this.accdata[i].RefAmount,
				};
				form.BillPassingAccountDetails.push(row);
			}
			for (var i = 0; i < this.data.DocumentRows.results.length; i++) {
			if (this.data.DocumentRows.results[i].FRMyear) {
				//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
				var date = this.data.DocumentRows.results[0].FRMyear;
				var DateInstance = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
				});
				this.FRMyear = dateFormat.format(DateInstance);
				this.FRMyear = this.formatdate(this.FRMyear);
			}
			var rowdetails = {
				"ItemCode": this.data.DocumentRows.results[i].MaterialCode,
				"ItemRevNumber": this.data.DocumentRows.results[i].ItemNumber,
				"Itemdecsription": this.data.DocumentRows.results[i].MaterialDescription,
				"ItemGroupCode": this.data.DocumentRows.results[i].ItemGroupCode,
				"GroupAccCode": this.data.DocumentRows.results[i].GroupAccountCode,
				"GroupAccDesc": this.data.DocumentRows.results[i].GroupAccountDescription,
				"AcceptedQty": this.data.DocumentRows.results[i].AcceptedQty,
				"RejectedQty": this.data.DocumentRows.results[i].RejectedQty,
				"ActualQty": this.data.DocumentRows.results[i].ActualQty,
				"InvoiceQty": this.data.DocumentRows.results[i].InvoiceQty,
				"ItemUom": this.data.DocumentRows.results[i].ItemUOM,
				"MatVal": this.data.DocumentRows.results[i].MaterialValue,
				"CGA": this.data.DocumentRows.results[i].CGA,
				"SGA": this.data.DocumentRows.results[i].SGA,
				"IGA": this.data.DocumentRows.results[i].IGA,
				"Packing": this.data.DocumentRows.results[i].Packing,
				"Freight": this.data.DocumentRows.results[i].Freight,
				"Others": this.data.DocumentRows.results[i].Others,
				"Total": this.data.DocumentRows.results[i].MRNLineValue,
				"ItemRateNew": this.data.DocumentRows.results[i].ItemRate,
				"ItemRate": this.data.DocumentRows.results[i].ActualItemRate,
				"CGP": this.data.DocumentRows.results[i].CGP,
				"SGP": this.data.DocumentRows.results[i].SGP,
				"IGP": this.data.DocumentRows.results[i].IGP,
				"HSNCode": this.data.DocumentRows.results[i].HSNCode,
				"CDT": this.data.DocumentRows.results[i].CDT,
				"CRT": this.data.DocumentRows.results[i].CRT,
				"ExchangeRate": this.data.DocumentRows.results[i].ExchangeRate,
				"BillRate": this.data.DocumentRows.results[i].CurrPORate,
				"PackingOrg": this.data.DocumentRows.results[i].PakingOrg,
				"FrieghtOrg": this.data.DocumentRows.results[i].FrieghtOrg,
				"OthersOrg": this.data.DocumentRows.results[i].OtherOrg,
				"VoucherNumber": this.data.DocumentRows.results[i].MRNNumber,
				"FromYear": this.FRMyear,
				"TRNLineNumber": this.data.DocumentRows.results[i].TRNLineNumber,
				"TCS": this.data.DocumentRows.results[i].TCS,
				"InvoiceRate": this.data.DocumentRows.results[i].InvoiceRate,
				"CurrPoRate": this.data.DocumentRows.results[i].CurrPORate
			};
			form.BillPassingMaterialDetails.push(rowdetails);
		}
			var formdatastr = JSON.stringify(form);
			this.hardcodedURL = "";
			// if (window.location.href.includes("launchpad")) {
			// 	this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1";
			// }
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.invoicecreation");
			}
			var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/PostBillPassing`;
			$.ajax({
				type: "POST",
				headers: {
					'loginid': that.getOwnerComponent().getModel().getHeaders().loginId,
					'Content-Type': 'application/json'
				},
				url: sPath,
				data: JSON.stringify({
					invoiceData: formdatastr
				}),
				context: this,
				success: function (textStatus, jqXHR) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.success("Bill Posted succesfully", {
						actions: [sap.m.MessageBox.Action.OK],
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						onClose: function (oAction) {
							if (oAction === "OK") {
								sap.fiori.invoicecreation.controller.formatter.onNavBack();
							}
						}
					});
				}.bind(this),
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					var errormsg = JSON.parse(error.responseText)
					MessageBox.error(errormsg.error.message.value);
				}
			});
		},
		onGenerateVoucherPress: function (oEvt) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			this.accdata = this.accdetailModel.getData().results;
			this.data = this.detailModel.getData();
			var form = {
				"UnitCode": this.UnitCode,
				"CreatedBy": this.getOwnerComponent().getModel().getHeaders().loginId,
				"CreatedIP": "",
				"DetailsList": [],
				"AccountDetails": []
			};
			for (var i = 0; i < this.accdata.length; i++) {
				if (this.accdata[i].BillDate) {
					//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
					var date = this.accdata[i].BillDate;
					var DateInstance = new Date(date);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					});
					this.BillDate = dateFormat.format(DateInstance);
					this.BillDate = this.formatdate(this.BillDate);
				}
				if (this.accdata[i].RefDate) {
					//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
					var date = this.accdata[i].RefDate;
					var DateInstance = new Date(date);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					});
					this.RefDate = dateFormat.format(DateInstance);
					this.RefDate = this.formatdate(this.RefDate);
				}
				var row = {
					"Sno": this.accdata[i].Sno,
					"AccountCode": this.accdata[i].AccountCode,
					"AccountDescription": this.accdata[i].AccountDescription,
					"Particulars": this.accdata[i].Particulars,
					"Amount": this.accdata[i].Amount,
					"AccType": this.accdata[i].AccType,
					"DedTds": this.accdata[i].DedTds,
					"TdsAmount": this.accdata[i].TdsAmount,
					"BillNumber": this.accdata[i].BillNumber,
					"BillDate": this.BillDate,
					"BillAmount": this.accdata[i].Billamount,
					"RefVoucherSlNumber": this.accdata[i].RefVoucherSlNumber,
					"OnlineFlag": this.accdata[i].Onlineflag,
					"BalAmount": this.accdata[i].BalAmount,
					"Flag2": this.accdata[i].Flag2,
					"OtherAmount": this.accdata[i].Otheramount,
					"RefNumber": this.accdata[i].RefNumber,
					"RefDate": this.RefDate,
					"CurrVal": this.accdata[i].CurrVal,
					"RefAmount": this.accdata[i].RefAmount,
				};
				form.AccountDetails.push(row);
			}
			if (this.data.MRNDate) {
				//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
				var date = this.data.MRNDate;
				var DateInstance = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
				});
				this.MRNDate = dateFormat.format(DateInstance);
				this.MRNDate = this.formatdate(this.MRNDate);
			}
			if (this.ReceiptDate) {
				//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
				var date = this.ReceiptDate;
				var DateInstance = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
				});
				this.ReceiptDate = dateFormat.format(DateInstance);
				this.ReceiptDate = this.formatdate(this.ReceiptDate);
			}
			if (this.SendToAccDate) {
				//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
				var date = this.SendToAccDate;
				var DateInstance = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
				});
				this.SendToAccDate = dateFormat.format(DateInstance);
				this.SendToAccDate = this.formatdate(this.SendToAccDate);
			}
			var rowdetails = {
				"Mrnnumber": this.data.DocumentRows.results[0].MRNNumber,
				"Mrndate": this.MRNDate,
				"AccountCode": this.AccCode,
				"AccountDescription": this.AccDesc,
				"ReceiptDate": this.ReceiptDate,
				"Senttoaccountdate": this.SendToAccDate,
				"Generateentry": "1",
				"TotalDebit": this.TotalDebit,
				"TotalCredit": this.TotalCredit,
				"Dedtds": this.DedTds,
				"Partycode": this.data.VendorCode,
				"Trncode": this.data.DocumentRows.results[0].TRNCode,
				"Vouchertype": this.VoucherType,
				"Empcode": "",
				"Tilldatepurchasevalue": this.TillDatePurchaseVal
			};
			form.DetailsList.push(rowdetails);

			var formdatastr = JSON.stringify(form);
			this.hardcodedURL = "";
			// if (window.location.href.includes("launchpad")) {
			// 	this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1";
			// }
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.invoicecreation");
			}
			var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/VoucherGen`;
			$.ajax({
				type: "POST",
				headers: {
					'loginid': that.getOwnerComponent().getModel().getHeaders().loginId,
					'Content-Type': 'application/json'
				},
				url: sPath,
				data: JSON.stringify({
					invoiceData: formdatastr
				}),
				context: this,
				success: function (textStatus, jqXHR) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.success("Voucher Generation succesfully", {
						actions: [sap.m.MessageBox.Action.OK],
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						onClose: function (oAction) {
							if (oAction === "OK") {
								sap.fiori.invoicecreation.controller.formatter.onNavBack();
							}
						}
					});
				}.bind(this),
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					var errormsg = JSON.parse(error.responseText)
					MessageBox.error(errormsg.error.message.value);
				}
			});
		},
		onCompleteInvoicePress: function (oEvt) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			this.accdata = this.accdetailModel.getData().results;
			this.data = this.detailModel.getData();
			var form = {
				"UnitCode": this.UnitCode,
				"CreatedBy": this.getOwnerComponent().getModel().getHeaders().loginId,
				"CreatedIP": "",
				"VoucherNumber": this.VoucherNumber
			};
			var formdatastr = JSON.stringify(form);
			this.hardcodedURL = "";
			// if (window.location.href.includes("launchpad")) {
			// 	this.hardcodedURL = "https://impautosuppdev.launchpad.cfapps.ap10.hana.ondemand.com/a91d9b1c-a59b-495f-aee2-3d22b25c7a3c.schedulingagreement.sapfiorischedulingagreement-0.0.1";
			// }
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.invoicecreation");
			}
			var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/PostVoucher`;
			$.ajax({
				type: "POST",
				headers: {
					'loginid': that.getOwnerComponent().getModel().getHeaders().loginId,
					'Content-Type': 'application/json'
				},
				url: sPath,
				data: JSON.stringify({
					invoiceData: formdatastr
				}),
				context: this,
				success: function (textStatus, jqXHR) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.success("Voucher Posted succesfully", {
						actions: [sap.m.MessageBox.Action.OK],
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						onClose: function (oAction) {
							if (oAction === "OK") {
								sap.fiori.invoicecreation.controller.formatter.onNavBack();
							}
						}
					});
				}.bind(this),
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					var errormsg = JSON.parse(error.responseText)
					MessageBox.error(errormsg.error.message.value);
				}
			});
		},
		formatdate: function (input) {
			const parts = input.split('/');
			const year = parseInt(parts[2], 10);
			const month = parseInt(parts[1], 10) - 1;
			const day = parseInt(parts[0], 10)
			const date = new Date(year, month, day);
			const localTimezoneOffset = date.getTimezoneOffset() * 60000;
			const adjustedDate = new Date(date.getTime() - localTimezoneOffset);
			const isoString = adjustedDate.toISOString().split('T')[0] + 'T00:00:00';
			return isoString + '+05:30';
		},
		// onFilterClear: function() {
		// 	var oView = this.getView();
		// 	oView.byId("MaterialId").setSelectedKey("");
		// },
		// handleMaterialHelp: function() {

		// 	if (!this.materialFragment) {
		// 		this.materialFragment = sap.ui.xmlfragment("sap.fiori.invoicecreation.fragment.fragMaterial", this);
		// 		this.getView().addDependent(this.materialFragment);
		// 		this._materialTemp = sap.ui.getCore().byId("materialTempId").clone();
		// 	}

		// 	sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
		// 		path: "/MaterialHelpSet?$filter=Ebeln eq '" + this.data1.Ebeln + "'",
		// 		template: this._materialTemp
		// 	});

		// 	this.materialFragment.open();

		// },
		// handleMaterialValueHelpSearch: function(evt) {
		// 	var sValue = evt.getParameter("value");
		// 	if (sValue) {
		// 		sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
		// 			path: "/MaterialHelpSet?$filter=Matnr eq '" + sValue + "' and Ebeln eq '" + this.data1.Ebeln + "'",
		// 			template: this._materialTemp
		// 		});
		// 	} else {
		// 		sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
		// 			path: "/MaterialHelpSet?$filter=Ebeln eq='" + this.data1.Ebeln + "' ",
		// 			template: this._materialTemp
		// 		});
		// 	}
		// },
		// handleMaterialValueHelpClose: function(evt) {
		// 	var oSelectedItem = evt.getParameter("selectedItem");
		// 	var Matnr = oSelectedItem.getBindingContext().getProperty("Matnr");
		// 	this.getView().byId("MaterialId").setValue(Matnr);
		// }
	});

});