sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/export/Spreadsheet",
	"sap/ui/export/library",
	"sap/m/MessageBox"
], function (Controller, Spreadsheet, exportLibrary, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.invoicecreation.controller.ASNReportView", {

		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.DataModel = new sap.ui.model.json.JSONModel();
			this.DataModel.setSizeLimit(10000000);
			this.getView().setModel(this.DataModel, "DataModel");
			this.detailModel = sap.ui.getCore().getModel("detailModel");
			this.loginModel = sap.ui.getCore().getModel("loginModel");
			this.getView().setModel(this.loginModel, "loginModel");
			this.localModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.localModel, "localModel");
			this._tableTemp = this.getView().byId("tableTempId").clone();
			
			this.oDataModel = sap.ui.getCore().getModel("oDataModel");
			this.getView().setModel(this.oDataModel);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			});
			
			this.curDate = new Date();
			//this.endDate = new Date(this.curDate.getTime() + 30 * 24 * 3600 * 1000);
			//this.getView().byId("endDateId").setMinDate(this.curDate);
			this.curDate = dateFormat.format(this.curDate);
			//this.endDate = dateFormat.format(this.endDate);
			//this.getView().byId("endDateId").setValue(this.curDate);
			//this.getView().byId("startDateId").setValue(this.curDate);
			//this.searhFilters = this.statusFilters = [];
			var that = this;
			this.unitCode = sessionStorage.getItem("unitCode") || "P01";
			this.getView().byId("PlantId").setValue(this.unitCode);
			this.getView().byId("InvStatusId").setSelectedKey("PENDING FOR BILL PASSING");
			this.InvStatus = this.getView().byId("InvStatusId").getSelectedKey();
			var oModel = this.getOwnerComponent().getModel();
			/*oModel.read("/GetPendingInvoiceList", {
				urlParameters: {
					UnitCode: this.unitCode,
					PoNum: '',
					MrnNumber: '',
					FromPOdate: '',
					ToPOdate: '',
					FromMrndate: '',
					ToMrndate: '',
					Status: this.InvStatus
				},
				success: function (oData) {
					that.DataModel.setData(oData);
					that.DataModel.refresh();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					//var value = JSON.parse(oError.response.body);
					//MessageBox.error(value.error.message.value);
					//MessageBox.error(oError.message);
				}
			});*/

			//var datePicker = this.getView().byId("startDateId");

			// datePicker.addDelegate({
			// 	onAfterRendering: function () {
			// 		datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
			// 	}
			// }, datePicker);

			// datePicker = this.getView().byId("endDateId");

			// datePicker.addDelegate({
			// 	onAfterRendering: function () {
			// 		datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
			// 	}
			// }, datePicker);
		},
		onFilterClear: function () {
			var data = this.localModel.getData();
			data.PONum = "";
			data.MRNNumber = "";
			data.POStartDate = "";
			data.POEndDate = "";
			data.MRNStartDate = "";
			data.MRNEndDate = "";
			this.localModel.refresh(true);
			 var oView = this.getView();
			oView.byId("poNumId").setValue("");
			oView.byId("MrnNumId").setValue("");
			oView.byId("postartDateId").setValue("");
			oView.byId("poendDateId").setValue("");
			oView.byId("mrnstartDateId").setValue("");
			oView.byId("mrnendDateId").setValue("");
		},

		onFilterGoPress: function () {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var data = this.localModel.getData();
			var oModel = this.getOwnerComponent().getModel();
			var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "ddMMMyyyy"
			});
			if(!data.MRNStartDate){
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error("Please enter MRN start date");
				return;
			}
			if(!data.MRNEndDate){
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error("Please enter MRN end date");
				return;
			}
			this.POEndDate = this.getView().byId("poendDateId").getDateValue();
			this.POStartDate = this.getView().byId("postartDateId").getDateValue();
			if(this.POEndDate){
				this.POEndDate = dateFormat1.format(this.POEndDate);
				this.POEndDate = this.POEndDate.substring(0, 2) + " " + this.POEndDate.substring(2, 5) + " " + this.POEndDate.substring(5, 9);
			}
			if(this.POStartDate){
			this.POStartDate = dateFormat1.format(this.POStartDate);
			this.POStartDate = this.POStartDate.substring(0, 2) + " " + this.POStartDate.substring(2, 5) + " " + this.POStartDate.substring(5, 9);
			}
			this.MRNEndDate = this.getView().byId("mrnendDateId").getDateValue();
			this.MRNStartDate = this.getView().byId("mrnstartDateId").getDateValue();
			if(this.MRNEndDate){
				this.MRNEndDate = dateFormat1.format(this.MRNEndDate);
				this.MRNEndDate = this.MRNEndDate.substring(0, 2) + " " + this.MRNEndDate.substring(2, 5) + " " + this.MRNEndDate.substring(5, 9);
			}
			if(this.MRNStartDate){
			this.MRNStartDate = dateFormat1.format(this.MRNStartDate);
			this.MRNStartDate = this.MRNStartDate.substring(0, 2) + " " + this.MRNStartDate.substring(2, 5) + " " + this.MRNStartDate.substring(5, 9);
			}
			if(!data.PONum){
				data.PONum = "";
			}
			if(!data.MRNNumber){
				data.MRNNumber = "";
			}
			if(!data.Plant){
				this.Plant = this.unitCode;
			}else if(data.Plant){
				this.Plant = data.Plant;
			}
			if(!data.POStartDate){
				this.POStartDate = "";
			}
			if(!data.POEndDate){
				this.POEndDate = "";
			}
			// if(!data.MRNStartDate){
			// 	this.MRNStartDate = "";
			// }
			// if(!data.MRNEndDate){
			// 	this.MRNEndDate = "";
			// }
			
			oModel.read("/GetPendingInvoiceList" ,{
				urlParameters: {
					UnitCode: this.Plant,
					PoNum: data.PONum,
					MrnNumber: data.MRNNumber,
					FromPOdate: this.POStartDate,
					ToPOdate: this.POEndDate,
					FromMrndate: this.MRNStartDate,
					ToMrndate: this.MRNEndDate,
					Status: data.InvStatus
				},
				success : function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.DataModel.setData(oData);
					that.DataModel.refresh();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					// var value = JSON.parse(oError.response.body);
					// MessageBox.error(value.error.message.value);
					//MessageBox.error(oError.message);
				}
		});
		},

		onItempress: function (oEvent) {
			var data = oEvent.getParameter("listItem").getBindingContext("DataModel").getProperty();
			//this.detailModel.setData(data);
			this.PoNum = data.PONumber.replace(/\//g, '-');
			this.MRNnumber = data.MRNNumber.replace(/\//g, '-');
			this.SendToAccDate = data.SendToAccDate.replace(/\//g, '-');
			this.ReceiptDate = data.ReceiptDate.replace(/\//g, '-');
			this.VoucherNumber = data.VoucherNumber.replace(/\//g, '-');
			this.router.navTo("ASNReportDetail", {
				"UnitCode": data.PlantCode,
				"PoNum": this.PoNum,
				"MRNnumber": this.MRNnumber,
				"AddressCode": data.VendorCode,
				"SendToAccDate": this.SendToAccDate,
				"TillDatePurchaseVal": data.TillDatePurchaseVal,
				"DedTds": data.DedTds,
				"TotalDebit": data.TotalDebit,
				"TotalCredit": data.TotalCredit,
				"VoucherType": data.VoucherType,
				"AccCode": data.AccCode,
				"AccDesc": data.AccDesc,
				"ReceiptDate": this.ReceiptDate,
				"VoucherNumber": this.VoucherNumber
			});
		},
		/////////////////////////////////////////Table Personalization////////////////////////////////
		onColumnSelection: function (event) {
			var that = this;
			var List = that.byId("List");
			var popOver = this.byId("popOver");
			if (List !== undefined) {
				List.destroy();
			}
			if (popOver !== undefined) {
				popOver.destroy();
			}
			/*----- PopOver on Clicking ------ */
			var popover = new sap.m.Popover(this.createId("popOver"), {
				showHeader: true,
				// showFooter: true,
				placement: sap.m.PlacementType.Bottom,
				content: []
			}).addStyleClass("sapMOTAPopover sapTntToolHeaderPopover sapUiResponsivePadding--header sapUiResponsivePadding--footer");

			/*----- Adding List to the PopOver -----*/
			var oList = new sap.m.List(this.createId("List"), {});
			this.byId("popOver").addContent(oList);
			var openAssetTable = this.getView().byId("TableDataId"),
				columnHeader = openAssetTable.getColumns();
			var openAssetColumns = [];
			for (var i = 0; i < columnHeader.length; i++) {
				var hText = columnHeader[i].getAggregation("header").getProperty("text");
				var columnObject = {};
				columnObject.column = hText;
				openAssetColumns.push(columnObject);
			}
			var oModel1 = new sap.ui.model.json.JSONModel({
				list: openAssetColumns
			});
			var itemTemplate = new sap.m.StandardListItem({
				title: "{oList>column}"
			});
			oList.setMode("MultiSelect");
			oList.setModel(oModel1);
			sap.ui.getCore().setModel(oModel1, "oList");
			var oBindingInfo = {
				path: 'oList>/list',
				template: itemTemplate
			};
			oList.bindItems(oBindingInfo);
			var footer = new sap.m.Bar({
				contentLeft: [],
				contentMiddle: [new sap.m.Button({
					text: "Cancel",
					press: function () {
						that.onCancel();
					}
				})],
				contentRight: [new sap.m.Button({
					text: "Save",
					press: function () {
						that.onSave();
					}
				})
				]

			});

			this.byId("popOver").setFooter(footer);
			var oList1 = this.byId("List");
			var table = this.byId("TableDataId").getColumns();
			/*=== Update finished after list binded for selected visible columns ==*/
			oList1.attachEventOnce("updateFinished", function () {
				var a = [];
				for (var j = 0; j < table.length; j++) {
					var list = oList1.oModels.undefined.oData.list[j].column;
					a.push(list);
					var Text = table[j].getHeader().getProperty("text");
					var v = table[j].getProperty("visible");
					if (v === true) {
						if (a.indexOf(Text) > -1) {
							var firstItem = oList1.getItems()[j];
							oList1.setSelectedItem(firstItem, true);
						}
					}
				}
			});
			popover.openBy(event.getSource());
		},
		/*================ Closing the PopOver =================*/
		onCancel: function () {
			this.byId("popOver").close();
		},
		/*============== Saving User Preferences ==================*/
		onSave: function () {
			var that = this;
			var oList = this.byId("List");
			var array = [];
			var items = oList.getSelectedItems();

			// Getting the Selected Columns header Text.
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var context = item.getBindingContext("oList");
				var obj = context.getProperty(null, context);
				var column = obj.column;
				array.push(column);
			}
			/*---- Displaying Columns Based on the selection of List ----*/
			var table = this.byId("TableDataId").getColumns();
			for (var j = 0; j < table.length; j++) {
				var Text = table[j].getHeader().getProperty("text");
				var Column = table[j].getId();
				var columnId = this.getView().byId(Column);
				if (array.indexOf(Text) > -1) {
					columnId.setVisible(true);
				} else {
					columnId.setVisible(false);
				}
			}

			this.byId("popOver").close();

		},
		/////////////////////////////////////////Table Personalization////////////////////////////////

		onFromDateChange: function (oEvent) {
			var FromDate = this.getView().byId("postartDateId").getDateValue();
			var ToDate = this.getView().byId("poendDateId").getDateValue();
			this.getView().byId("poendDateId").setMinDate(FromDate);
			if (ToDate <= FromDate) {
				this.getView().byId("poendDateId").setDateValue(new Date(FromDate));
			}
			oEvent.getSource().$().find('INPUT').attr('disabled', true).css('color', '#000000');
		}
	});

});