sap.ui.define([
	"sap/m/MessageBox"
], function(MessageBox) {
	"use strict";

	return {

		openVendorSearchDialog: function(oEvent, oController) {
			var sDialogName = "VendorSearchDialog";
			oController.mDialogs = oController.mDialogs || {};
			var oDialog = oController.mDialogs[sDialogName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oDialog) {
				oController.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "ch.neo.fiori.mm.grchange.view." + sDialogName

					});
					oController.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oDialog = oView.getContent()[0];
					oController.mDialogs[sDialogName] = oDialog;
				}.bind(oController));
			}

			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();
				
				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(oController)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

		openPurchasingGroupSearchDialog: function(oEvent, oController) {
			var sDialogName = "PurchasingGroupSearchDialog";
			oController.mDialogs = oController.mDialogs || {};
			var oDialog = oController.mDialogs[sDialogName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oDialog) {
				oController.getOwnerComponent().runAsOwner(function() {

					//Instantiates an XMLView of the given name and with the given ID.
					//This class does not have its own settings, but all settings applicable to the base type sap.ui.core.mvc.View can be used.
					oView = sap.ui.xmlview({
						viewName: "ch.neo.fiori.mm.grchange.view." + sDialogName
					});
					oController.getView().addDependent(oView);

					//Returns the view's Controller instance + set Route
					oView.getController().setRouter(this.oRouter);

					oDialog = oView.getContent()[0];

					oController.mDialogs[sDialogName] = oDialog;
				}.bind(oController));
			}

			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();

				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(oController)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},

	openUsersSearchDialog: function(oEvent, oController) {
		
		
			var sDialogName = "UserSearchDialog";
			oController.mDialogs = oController.mDialogs || {};
			var oDialog = oController.mDialogs[sDialogName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oDialog) {
				oController.getOwnerComponent().runAsOwner(function() {

					//Instantiates an XMLView of the given name and with the given ID.
					//This class does not have its own settings, but all settings applicable to the base type sap.ui.core.mvc.View can be used.
					oView = sap.ui.xmlview({
						viewName: "ch.neo.fiori.mm.grchange.view." + sDialogName
					});
					oController.getView().addDependent(oView);

					//Returns the view's Controller instance + set Route
					oView.getController().setRouter(this.oRouter);

					oDialog = oView.getContent()[0];

					oController.mDialogs[sDialogName] = oDialog;
				}.bind(oController));
			}

			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();

				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(oController)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},















		/**
		 * Generate a pseudo GUID
		 * ([)taken from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript)
		 * @returns {string} The generated GUID
		 * @public
		 * */
		createGuid: function() {
			var now = new Date();
			return now.getSeconds().toString() + now.getMilliseconds().toString();
		}

	};
});