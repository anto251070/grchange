sap.ui.define([], function() {
	"use strict";
	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */

		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		vendorClassificationStatusState: function(sCriticality) {
			if (!sCriticality) {
				return sap.ui.core.ValueState.None;
			}
			switch (sCriticality) {
				case 1:
					// return sap.ui.core.ValueState.Error;
					 return sap.ui.core.ValueState.Success;
				case 2:
					return sap.ui.core.ValueState.Warning;
				case 3:
						return sap.ui.core.ValueState.Error;
					// return sap.ui.core.ValueState.Sucess;
				default:
					return sap.ui.core.ValueState.None;
			}
		},
		purchaseOrderHeaderStatusText: function(sProcessingStateCode, sReleaseIndicatorDescription) {
			//var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!sProcessingStateCode) {
				return "";
			}
			switch (sProcessingStateCode) {
				case "02":
					return "Actif";
				case "08":
					return "Refusée";
				default:
					return sReleaseIndicatorDescription;
			}
		},
		purchaseOrderHeaderStatusState: function(sCriticality) {
			if (!sCriticality) {
				return sap.ui.core.ValueState.None;
			}
			
			switch (sCriticality) {
				case 1:
					return sap.ui.core.ValueState.Error;
				case 2:
					return sap.ui.core.ValueState.Warning;
				case 3:
					return sap.ui.core.ValueState.Success;
				default:
					return sap.ui.core.ValueState.None;
			}
		}
	};
});