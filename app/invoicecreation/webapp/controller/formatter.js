jQuery.sap.declare("sap.fiori.invoicecreation.controller.formatter");
sap.fiori.invoicecreation.controller.formatter = {
	formatDate: function (oDate) {
		if (oDate && oDate !== "00000000") {
			var date = oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4);
			return sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			}).format(new Date(date));
		} else {
			return "";
		}
	},
	onNavBack: function () {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash();

		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ASNReportView", {}, true);
		}

	},
	gstCurrency: function (amount, currency) {
		if (amount) {
			return currency;
		} else {
			return "";
		}
	},
	checkStatus: function (status) {
		if (status === "01") {
			return "Error";
		} else if (status === "02") {
			return "None";
		} else if (status === "03") {
			return "Warning";
		} else if (status === "04") {
			return "Warning";
		} else if (status === "05") {
			return "Warning";
		} else if (status === "06") {
			return "Success";
		} else {
			return "Error";
		}
	},
	vendorVisible: function (userType) {
		if (userType === "employee") {
			return true;
		} else {
			return false;
		}
	},
	titleActive: function (flag) {
		if (flag) {
			return true;
		}
		return false;
	},
	StatusColorClass: function (StatusText) {
		this.removeStyleClass("New");
		this.removeStyleClass("YetToShip");
		this.removeStyleClass("completed");
		this.removeStyleClass("InTransit");
		this.removeStyleClass("ReachedPlant");
		this.removeStyleClass("UnloadingStarted");
		this.removeStyleClass("DraftAsn");
		switch (StatusText) {
		case "New":
			this.addStyleClass("New");
			break;
		case "Yet to Ship":
			this.addStyleClass("YetToShip");
			break;
		case "Draft Asn":
			this.addStyleClass("DraftAsn");
			break;
		case "Completed":
			this.addStyleClass("completed");
			break;
		case "In Transit":
			this.addStyleClass("InTransit");
			break;
		case "Reached Plant":
			this.addStyleClass("ReachedPlant");
			break;
		case "Unloading Started":
			this.addStyleClass("UnloadingStarted");
			break;
		}
		return StatusText;
	},
	RemoveNull: function (aData) {
		for (var j = 0; j < aData.results.length; j++) {
			if (!aData.results[j].RchPlantDt || aData.results[j].RchPlantDt === "00000000") {
				delete aData.results[j].RchPlantDt;
			}
			if (!aData.results[j].CreatedOn || aData.results[j].CreatedOn === "00000000") {
				delete aData.results[j].CreatedOn;
			}
			if (!aData.results[j].ShipmentDate || aData.results[j].ShipmentDate === "00000000") {
				delete aData.results[j].ShipmentDate;
			}
			if (!aData.results[j].EwayDate || aData.results[j].EwayDate === "00000000") {
				delete aData.results[j].EwayDate;
			}
		}
		return aData;
	}
};