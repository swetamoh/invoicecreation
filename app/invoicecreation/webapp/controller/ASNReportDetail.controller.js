sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.invoicecreation.controller.ASNReportDetail", {

		onInit: function() {
			//this._tableTemp = this.getView().byId("tableTempId").clone();
			this.detailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.detailModel, "detailModel");
			this.accdetailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.accdetailModel, "accdetailModel");
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);
		},
		
		handleRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") === "ASNReportDetail") {
				var that = this;
				//this.detailModel.refresh(true);
                var oModel = this.getOwnerComponent().getModel();
				var data = oEvent.getParameter("arguments");
                this.UnitCode = data.UnitCode;
                this.PoNum = data.PoNum.replace(/-/g, '/');
				this.MRNnumber = data.MRNnumber.replace(/-/g, '/');
                this.AddressCode = data.AddressCode;
				this.InvoiceStatus = data.Status;
				//this.getView().byId("pageId").setTitle("ASN Number - " + this.AsnNumber);
                var request = "/GetPoDetailstoCreateInvoice";
				oModel.read(request, {
                    urlParameters: {
						"$expand": "DocumentRows",
                        UnitCode: this.UnitCode,
                        PoNum:  this.PoNum,
                        MRNnumber: this.MRNnumber,
                        AddressCode: this.AddressCode
                    },
					success: function (oData) {
						var filteredPurchaseOrder = oData.results.find(po => po.PONumber === that.PoNum);
						if (filteredPurchaseOrder) {
							that.detailModel.setData(filteredPurchaseOrder);
							that.detailModel.refresh(true);
							that.MRNDate = that.detailModel.getData().MRNDate;
							that.getAccDetails();
						} else {
							MessageBox.error("Data not found");
						}
					},
					error: function (oError) {
						// var value = JSON.parse(oError.response.body);
						// MessageBox.error(value.error.message.value);
						MessageBox.error(oError.message);
					}
				});

			}
		},
		getAccDetails: function(){
			var that = this;
            var oModel = this.getOwnerComponent().getModel();
			this.MRNDate =  sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM yyyy"
			}).format(new Date(this.MRNDate));
			var request = "/GetMRNAccountDetails";
				oModel.read(request, {
                    urlParameters: {
                        UnitCode: this.UnitCode,
                        MRNnumber: this.MRNnumber,
						MRNDate: this.MRNDate
                    },
					success: function (oData) {
						that.accdetailModel.setData(oData);
						that.accdetailModel.refresh(true);
					},
					error: function (oError) {
						// var value = JSON.parse(oError.response.body);
						// MessageBox.error(value.error.message.value);
						MessageBox.error(oError.message);
					}
				});
		},
		onNavPress: function() {
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
		onBillBookingPress: function(oEvt) {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			this.accdata = this.accdetailModel.getData().results;
			this.data = this.detailModel.getData();
			var form = {
				"UnitCode": this.UnitCode,
				"CreatedBy": "Manikandan",
				"CreatedIP": "",
				"BillPassingAccountDetails": [],
				"BillPassingMaterialDetails": []
			};
			for (var i = 0; i < this.accdata.length; i++){
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
		if (this.data.DocumentRows.results[0].FRMyear) {
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
			"ItemCode": 1,
			"ItemRevNumber": this.data.DocumentRows.results[0].MaterialCode,
			"Itemdecsription": this.data.DocumentRows.results[0].MaterialDescription,
			"ItemGroupCode": this.data.DocumentRows.results[0].ItemGroupCode,
			"GroupAccCode": this.data.DocumentRows.results[0].GroupAccountCode,
			"GroupAccDesc": this.data.DocumentRows.results[0].GroupAccountDescription,
			"AcceptedQty": this.data.DocumentRows.results[0].AcceptedQty, 
			"RejectedQty": this.data.DocumentRows.results[0].RejectedQty,
			"ActualQty": this.data.DocumentRows.results[0].ActualQty,
			"InvoiceQty": this.data.DocumentRows.results[0].InvoiceQty,
			"ItemUom": this.data.DocumentRows.results[0].ItemUOM,
			"MatVal": this.data.DocumentRows.results[0].MaterialValue,
			"CGA": this.data.DocumentRows.results[0].CGA,
			"SGA": this.data.DocumentRows.results[0].SGA,
			"IGA": this.data.DocumentRows.results[0].IGA,
			"Packing": this.data.DocumentRows.results[0].Packing,
			"Freight": this.data.DocumentRows.results[0].Freight,
			"Others": this.data.DocumentRows.results[0].Others,
			"Total": this.data.DocumentRows.results[0].MRNLineValue,
			"ItemRateNew": this.data.DocumentRows.results[0].ItemRate,
			"ItemRate": this.data.DocumentRows.results[0].ActualItemRate,
			"CGP": this.data.DocumentRows.results[0].CGP,
			"SGP": this.data.DocumentRows.results[0].SGP,
			"IGP": this.data.DocumentRows.results[0].IGP,
			"HSNCode": this.data.DocumentRows.results[0].HSNCode,
			"CDT": this.data.DocumentRows.results[0].CDT,
			"CRT": this.data.DocumentRows.results[0].CRT,
			"ExchangeRate": this.data.DocumentRows.results[0].ExchangeRate,
			"BillRate": this.data.DocumentRows.results[0].MRNLineValue,
			"PackingOrg": this.data.DocumentRows.results[0].PakingOrg,
			"FrieghtOrg": this.data.DocumentRows.results[0].FrieghtOrg,
			"OthersOrg": this.data.DocumentRows.results[0].OtherOrg,
			"VoucherNumber": this.data.DocumentRows.results[0].MRNNumber,
			"FromYear": this.FRMyear,
			"TRNLineNumber": this.data.DocumentRows.results[0].TRNLineNumber,
			"TCS": this.data.DocumentRows.results[0].TCS,
			"InvoiceRate": this.data.DocumentRows.results[0].InvoiceRate,
			"CurrPoRate": this.data.DocumentRows.results[0].CurrPORate
		};
		form.BillPassingMaterialDetails.push(rowdetails);

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
						'Content-Type': 'application/json'
					},
					url: sPath,
					data: JSON.stringify({
						invoiceData: formdatastr
					}),
					context: this,
					success: function (textStatus, jqXHR) {
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
						MessageBox.error("Bill Posting failed");
					}
				});
		},
		onCompleteInvoicePress: function(oEvt) {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			this.accdata = this.accdetailModel.getData().results;
			this.data = this.detailModel.getData();
			var form = {
				"UnitCode": this.UnitCode,
				"CreatedBy": "Manikandan",
				"CreatedIP": "",
				"DetailsList": [],
				"AccountDetails": []
			};
			for (var i = 0; i < this.accdata.length; i++){
				if (this.accdata[i].Billdate) {
					//var date = this.accdata[i].Billdate.substring(4, 6) + "/" + this.accdata[i].Billdate.substring(6, 8) + "/" + this.accdata[i].Billdate.substring(0, 4);
					var date = this.accdata[i].Billdate;
					var DateInstance = new Date(date);
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
					});
					this.Billdate = dateFormat.format(DateInstance);
					this.Billdate = this.formatdate(this.Billdate);
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
		var rowdetails = {
			"Mrnnumber": this.data.DocumentRows.results[0].MRNNumber,
			"Mrndate": this.MRNDate,
			"AccountCode": this.data.DocumentRows.results[0].GroupAccountCode,
			"AccountDescription": this.data.DocumentRows.results[0].GroupAccountDescription,
			"ReceiptDate": "", 
			"Senttoaccountdate": "",
			"Generateentry": "",
			"TotalDebit": "",
			"TotalCredit": "",
			"Dedtds": "",
			"Partycode": "",
			"Trncode": this.data.DocumentRows.results[0].TRNCode,
			"Vouchertype": "",
			"Empcode": "",
			"Tilldatepurchasevalue": ""
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
				var sPath = this.hardcodedURL + `/v2/odata/v4/catalog/PostVoucher`;
				$.ajax({
					type: "POST",
					headers: {
						'Content-Type': 'application/json'
					},
					url: sPath,
					data: JSON.stringify({
						invoiceData: formdatastr
					}),
					context: this,
					success: function (textStatus, jqXHR) {
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
						MessageBox.error("Voucher Posting failed");
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