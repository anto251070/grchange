sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"ch/neo/fiori/mm/grchange/controller/BaseController",
	"sap/m/MessageBox",
	"ch/neo/fiori/mm/grchange/libs/Attachments"
], function (UIComponent, History, JSONModel, BaseController, MessageBox, Attachments) {
	"use strict";

	return BaseController.extend("ch.neo.fiori.mm.grchange.controller.GRChange", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onInit: function () {
			// map Model data to View inputs
			this._oView = this.getView();

			// Global references
			this._oComponent = sap.ui.core.Component.getOwnerComponentFor(this.getView());
			this._oText = this._oComponent.getModel("i18n").getResourceBundle();

			this.mBindingOptions = {};
			this._oStandardUploader = this._oView.byId("UploadCollection-1-uploader"); // used by Attachments.js (sub controller of the fragment)

			// Before show
			this.getView().addEventDelegate({
				onBeforeShow: function () {
					Attachments.init(this);
					this._onBeforeShow();
				}.bind(this)
			});
			
		 
		},
		/**
		 * When the View is displayed (each time)
		 * @public
		 * */
		_onBeforeShow: function () {
			sap.ui.getCore().getModel("GoodsReceiptDelete").refresh(true);

			var GoodsReceiptFiles = sap.ui.getCore().getModel("GoodsReceiptDelete").getProperty("/Files");
            	
			this.OldCreationDate  = sap.ui.getCore().getModel("GoodsReceiptDelete").getProperty("/CreationDate").getFullYear();
			
		},
		
	    /**
		 * Handle change date
		 * @param {object} oEvent The event
		 * @public
		 */
		onhandlechangedate: function (oEvent) {
			
		  var data =	oEvent.getParameters().value;
  	      var New_date = data.toString();                   // data.getUTCFullYear(); 
		 //   var New_date = new Date(data).getUTCFullYear(); 
	    //   var n = New_date.search(",");
	       
		  	this.NewCreationDate  =  New_date.substr(6 , 4);
		  	
		  	
		  	
		  	jQuery.sap.log.error("this.NewCreationDate" + this.NewCreationDate );
		  	
		  	
		},
		
 
    
		
		
		/***********************************************************************************************************/
		/*                                    ↓ ATTACHMENTS-RELATED FUNCTIONS ↓                                    */
		/***********************************************************************************************************/

		/**
		 * Handle click on New Attachment button: open a dialog for attachment type
		 * @param {object} oEvent The event
		 * @public
		 */
		onNewAttachment: function (oEvent) {
			var lcFragmentPath = "ch.neo.fiori.mm.grchange.view.fragment.";
			var fragment = Attachments.getTypesFragment(lcFragmentPath);
			this._dialog = sap.ui.xmlfragment(fragment, this);

			// so that the fragment can access the model, just like the view does
			this.getView().addDependent(this._dialog);

			this._dialog.open();
		},
		/**
		 * The user has validated the Attachment Type dialog; now display the File Explorer popup, by triggering a click on the standard file input (which is hidden)
		 * @param {object} oEvent The event
		 * @public
		 */
		onAttachDialogOK: function (oEvent) {
			// store the Archive Type chosen by the user on the popup, before closing it
			// (store the complete Archive Type model, not just the selected key)

			this._archiveType = this._oView
				.getModel()
				.getProperty("/ArchiveTypes('" + sap.ui.getCore().byId("archivetype").getSelectedKey() + "')");

			this._closeDialog();

			// Usage of private members of SAPUI5 objects is not allowed
			//  Private members of SAPUI5 objects must never be used in SAP Fiori applications. 
			//  They can be changed by SAPUI5 at anytime and the application might not work anymore
			//	Attachments.triggerClick(this); //

			var oControlUC = this.getView().byId("UploadCollection");
			oControlUC.openFileDialog();

		},
		/**
		 * Close the attachment dialog
		 * @param {object} oEvent The event
		 * @public
		 */
		onAttachDialogKO: function (oEvent) {
			this._closeDialog();
		},
		/**
		 * Close the dialog and destroy it, to avoid duplicate Ids in DOM elements
		 * @private
		 */
		_closeDialog: function () {
			this._dialog.close();
			this._dialog.destroy();
		},

		/**
		 * See Attachment.js
		 * @param {object} oEvent The event
		 * @public
		 */
		onAttachChange: function (oEvent) {
			Attachments.onChange(this, oEvent);
		},
		/**
		 * See Attachment.js
		 * @param {object} oEvent The event
		 * @public
		 */
		onAttachDeleted: function (oEvent) {
			Attachments.onDelete(this, oEvent);
		},

		/**
		 * See Attachment.js
		 * @param {object} oEvent The event
		 * @public
		 */
		onAttachTypeMissmatch: function (oEvent) {
			Attachments.onTypeMissmatch(this, oEvent);
		},
		/***********************************************************************************************************/
		/*                                     ATTACHMENTS-RELATED FUNCTIONS End                                   */
		/***********************************************************************************************************/
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ch.neo.fiori.mm.gr.creategrcreate.view.GRCreate
		 */

		onBeforeRendering: function () {

			// Refresh model
			var oTableData = sap.ui.getCore().byId(this.createId("itemstable"));
			oTableData.getModel().refresh();

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onAfterRendering: function () {

			this._onBeforeShow();

		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ch.neo.fiori.mm.grchange.view.GRDelete
		 */
		onExit: function () {
			var oTableData = sap.ui.getCore().byId(this.createId("itemstable"));
			oTableData.getModel().refresh();
		},

		/**
		 * Handle Save Action
		 * @public
		 */
		onSaveGoodsReceiptButtonPress: function () {
			var oGoodsReceiptSave = JSON.parse(JSON.stringify(sap.ui.getCore().getModel("GoodsReceiptDelete").getData()));

			this.openConfirmDialogSave("si18nTitleSave", "si18nTextSave");

		},

		/**
		 * Handle Delete Action
		 * @public
		 */
		onDeleteGoodsReceiptButtonPress: function () {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oGoodsReceiptDelete = JSON.parse(JSON.stringify(sap.ui.getCore().getModel("GoodsReceiptDelete").getData()));
 
             var Old_date = this.OldCreationDate.toString(); 
            jQuery.sap.log.error("this.OldCreationDate" + Old_date);


			if ( ( this.NewCreationDate  !== Old_date ) 
			 &&  ( this.NewCreationDate  !== undefined ) ) {
			 	
			 	
			 	
				MessageBox.error(
					"Data Registrazione: Selezionare lo stesso anno " + this.OldCreationDate, {
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
				return;
			}



			//chek if one OK
			function search(myArray) {
				for (var i = 0; i < myArray.length; i++) {
					if (myArray[i].OK === true) {
						return myArray[i];
					}
				}
			}

			var resultObject = search(oGoodsReceiptDelete.GoodsReceiptItems);

			if (!resultObject) {
				MessageBox.error(
					"Seleziona almeno una riga.", {
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
				return;
			}

			this.openConfirmDialog("si18nTitle", "si18nText");

		},
		/**
		 * openConfirmDialogSave
		 * Generic Confirmation Dialog for reuse
		 * @param si18nTitle
		 * @param si18nText
		 * */
		openConfirmDialogSave: function (si18nTitle, si18nText) {
			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				this._oText.getText(si18nText), {
					title: this._oText.getText(si18nTitle),
					actions: [sap.m.MessageBox.Action.OK, "Annula"],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === sap.m.MessageBox.Action.OK) {
							that._SaveGR("OK");
						}
					}
				}
			);
			return false;
		},
		/**
		 * openConfirmDialog
		 * Generic Confirmation Dialog for reuse
		 * @param si18nTitle
		 * @param si18nText
		 * */
		openConfirmDialog: function (si18nTitle, si18nText) {
			var that = this;
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(
				this._oText.getText(si18nText), {
					title: this._oText.getText(si18nTitle),
					actions: [sap.m.MessageBox.Action.OK, "Annulla"],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function (sAction) {
						if (sAction === sap.m.MessageBox.Action.OK) {
							that._DeleteGR("OK");
						}
					}
				}
			);
			return false;
		},

		/**
		 * Helper to read query parameters (for navigation purpose)
		 * @param {val} date
		 * @returns {val} The query parameters
		 * @private
		 */
		_changedate: function (val) {
			var dd = val.substr(0, 2);
			var mm = val.substr(3, 2);
			var yy = val.substr(6, 2);
			return (mm + "/" + dd + "/" + yy);

		},
		/** 
		 * Save GR
		 * @param aArguments  OK or KO
		 */

		_SaveGR: function (aArguments) {
			if (aArguments === "OK") {
				var oGoodsReceiptSave = JSON.parse(JSON.stringify(sap.ui.getCore().getModel("GoodsReceiptDelete").getData()));

				// set Action 
                oGoodsReceiptSave.Action = "UPDATE";
                
				for (var i = 0; i < oGoodsReceiptSave.GoodsReceiptItems.length; i++) {
					var oGoodsReceiptSaveItem = oGoodsReceiptSave.GoodsReceiptItems[i];
					oGoodsReceiptSaveItem.Ordered = oGoodsReceiptSaveItem.Ordered.toString();
					oGoodsReceiptSaveItem.Delivered = oGoodsReceiptSaveItem.Delivered.toString();
					oGoodsReceiptSaveItem.Quantity = oGoodsReceiptSaveItem.Quantity.toString();
					oGoodsReceiptSaveItem.UnitMeasure = oGoodsReceiptSaveItem.UnitMeasure.toString();

					//to avoid Fehler beim Parsen eines XML-Streams.
					if (oGoodsReceiptSaveItem.OK === "") {
						oGoodsReceiptSaveItem.OK = false;
					}
				}

				if (oGoodsReceiptSave.Files.length === 0) {
					delete oGoodsReceiptSave.Files;

				} else {
					for (var j = 0; j < oGoodsReceiptSave.Files.length; j++) {
						var oAttachment = oGoodsReceiptSave.Files[j];

						// the existents File haven't got
						//GoodsReceiptId:  
						//MaterialDocumentYear 
						// the existents don't push to backend
						// if (oAttachment.GoodsReceiptId === oGoodsReceiptSave.Id){ 
						//     delete oGoodsReceiptSave.Files[j];
						// } else {

						oAttachment.FileContent = oAttachment.FileContent.substr(28);
						oAttachment.ArchiveTypeId = oAttachment.ArchiveType;
						delete oAttachment.ArchiveType;
						delete oAttachment.CreatedOn;
						delete oAttachment.URL;

						//}

					}
				}
				oGoodsReceiptSave.PostingDate = new Date(oGoodsReceiptSave.PostingDate);
				oGoodsReceiptSave.PostingDate.setMinutes(oGoodsReceiptSave.PostingDate.getMinutes() + 12 * 60);

				oGoodsReceiptSave.CreationDate = new Date(oGoodsReceiptSave.CreationDate);
				oGoodsReceiptSave.CreationDate.setMinutes(oGoodsReceiptSave.CreationDate.getMinutes() + 12 * 60);

				delete oGoodsReceiptSave.VendorName;
				delete oGoodsReceiptSave.Description;
				delete oGoodsReceiptSave.Creator;

				// Handle request sent
				this.getModel().attachEventOnce("requestSent", function (oEvent) {
					sap.ui.core.BusyIndicator.show();
				}, this);

				// Handle request success
				this.getModel().attachEventOnce("requestCompleted", function (oEvent) {

					sap.ui.core.BusyIndicator.hide();

					if (oEvent.getParameters().success) {

						// Enable create buttons
						if (this.byId("GRDeleteButton")) {
							this.byId("GRDeleteButton").setEnabled(true);
						}
						if (this.byId("GRSaveButton")) {
							this.byId("GRSaveButton").setEnabled(true);
						}
						var oGoodsReceiptSaveResponse = JSON.parse(oEvent.getParameters().response.responseText).d;

						// this.getModel("GoodsReceiptDelete").setProperty("Id", GoodsReceiptDeleteResponse.Id);
						// this.getModel("GoodsReceiptDelete").setProperty("MaterialDocumentYear", oGoodsReceiptSaveResponse.MaterialDocumentYear);

						this._showSuccessMessageSave(oGoodsReceiptSaveResponse.Id, oGoodsReceiptSaveResponse.MaterialDocumentYear);
					}
				}, this);

				this.getModel().attachEventOnce("requestFailed", function (oEvent) {

					// Enable create buttons
					if (this.byId("GRDeleteButton")) {
						this.byId("GRDeleteButton").setEnabled(true);
					}
					if (this.byId("GRSaveButton")) {
						this.byId("GRSaveButton").setEnabled(true);
					}
					var oParams = oEvent.getParameters();
					var err_data = JSON.parse(oParams.response.responseText);
					this._showServiceErrorSave(err_data.error.message.value);

				}, this);

				this.getModel().create("/GoodsReceiptHeaders", oGoodsReceiptSave, null, null, null);

				// Disable create buttons
				if (this.byId("GRDeleteButton")) {
					this.byId("GRDeleteButton").setEnabled(false);
				}
				if (this.byId("GRSaveButton")) {
					this.byId("GRSaveButton").setEnabled(false);
				}
			}
		},
		/** 
		 * Delete GR
		 * @param aArguments  OK or KO
		 */
		_DeleteGR: function (aArguments) {

			if (aArguments === "OK") {

	 

				var oGoodsReceiptDelete = JSON.parse(JSON.stringify(sap.ui.getCore().getModel("GoodsReceiptDelete").getData()));
			
				// set Action 
                oGoodsReceiptDelete.Action = "DELETE";
                
                
				for (var i = 0; i < oGoodsReceiptDelete.GoodsReceiptItems.length; i++) {
					var oGoodsReceiptDeleteItem = oGoodsReceiptDelete.GoodsReceiptItems[i];
					oGoodsReceiptDeleteItem.Ordered = oGoodsReceiptDeleteItem.Ordered.toString();
					oGoodsReceiptDeleteItem.Delivered = oGoodsReceiptDeleteItem.Delivered.toString();
					oGoodsReceiptDeleteItem.Quantity = oGoodsReceiptDeleteItem.Quantity.toString();
					oGoodsReceiptDeleteItem.UnitMeasure = oGoodsReceiptDeleteItem.UnitMeasure.toString();

					//to avoid Fehler beim Parsen eines XML-Streams.
					if (oGoodsReceiptDeleteItem.OK === "") {
						oGoodsReceiptDeleteItem.OK = false;
					}
				}

				if (oGoodsReceiptDelete.Files.length === 0) {
					delete oGoodsReceiptDelete.Files;

				} else {
					for (var j = 0; j < oGoodsReceiptDelete.Files.length; j++) {
						var oAttachment = oGoodsReceiptDelete.Files[j];
						oAttachment.FileContent = oAttachment.FileContent.substr(28);
						oAttachment.ArchiveTypeId = oAttachment.ArchiveType;
						delete oAttachment.ArchiveType;
						delete oAttachment.CreatedOn;
						delete oAttachment.URL;
					}
				}

				oGoodsReceiptDelete.PostingDate = new Date(oGoodsReceiptDelete.PostingDate);
				oGoodsReceiptDelete.PostingDate.setMinutes(oGoodsReceiptDelete.PostingDate.getMinutes() + 12 * 60);

				oGoodsReceiptDelete.CreationDate = new Date(oGoodsReceiptDelete.CreationDate);
				oGoodsReceiptDelete.CreationDate.setMinutes(oGoodsReceiptDelete.CreationDate.getMinutes() + 12 * 60);

				delete oGoodsReceiptDelete.VendorName;
				delete oGoodsReceiptDelete.Description;
				delete oGoodsReceiptDelete.Creator;

				// Handle request sent
				this.getModel().attachEventOnce("requestSent", function (oEvent) {
					sap.ui.core.BusyIndicator.show();
				}, this);

				// Handle request success
				this.getModel().attachEventOnce("requestCompleted", function (oEvent) {

					sap.ui.core.BusyIndicator.hide();

					if (oEvent.getParameters().success) {

						// Enable create buttons
						if (this.byId("GRDeleteButton")) {
							this.byId("GRDeleteButton").setEnabled(true);
						}

						var GoodsReceiptDeleteResponse = JSON.parse(oEvent.getParameters().response.responseText).d;

						this.getModel("GoodsReceiptDelete").setProperty("Id", GoodsReceiptDeleteResponse.Id);
						this.getModel("GoodsReceiptDelete").setProperty("MaterialDocumentYear", GoodsReceiptDeleteResponse.MaterialDocumentYear);

						this._showSuccessMessage(GoodsReceiptDeleteResponse.Id, GoodsReceiptDeleteResponse.MaterialDocumentYear);
					}
				}, this);

				this.getModel().attachEventOnce("requestFailed", function (oEvent) {

					// Enable create buttons
					if (this.byId("GRDeleteButton")) {
						this.byId("GRDeleteButton").setEnabled(true);
					}

					var oParams = oEvent.getParameters();
					var err_data = JSON.parse(oParams.response.responseText);
					this._showServiceError(err_data.error.message.value);

				}, this);

				this.getModel().create("/GoodsReceiptHeaders", oGoodsReceiptDelete, null, null, null);

				// Disable create buttons
				if (this.byId("GRDeleteButton")) {
					this.byId("GRDeleteButton").setEnabled(false);
				}
			}
		},

		/**
		 * Show Error Message from backend - Delete Button
		 * @public
		 */

		_showServiceError: function (responseText) {

			MessageBox.error(
				responseText, {
					id: "serviceErrorsMessageBox",
					title: this._oText.getText("delGRTitle"),
					textAlignment: "Center",
					//styleClass : this._oComponent.getContentDensityClass(),

					actions: [sap.m.MessageBox.Action.OK],
					onClose: function () {

					}.bind(this)
				}
			);

		},
		/**
		 * Show Error Message from backend - Save Button
		 * @public
		 */

		_showServiceErrorSave: function (responseText) {

			MessageBox.error(
				responseText, {
					id: "serviceErrorsMessageBox",
					title: this._oText.getText("ChangeGRTitle"),
					textAlignment: "Center",
					//styleClass : this._oComponent.getContentDensityClass(),

					actions: [sap.m.MessageBox.Action.OK],
					onClose: function () {

					}.bind(this)
				}
			);

		},
		_showSuccessMessage: function (MaterialDocumentId, MaterialDocumentYear) {

			MessageBox.success(
				"Entrata Merci cancellata :-) Numero " + MaterialDocumentId + " " + MaterialDocumentYear, {
					id: "serviceSuccessMessageBox",
					title: this._oText.getText("ChangeGRTitle"),
					textAlignment: "Center",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function () {

						this._reloadApp();

					}.bind(this)
				}
			);

		},
		_showSuccessMessageSave: function (MaterialDocumentId, MaterialDocumentYear) {

			MessageBox.success(
				"Entrata Merci modificata :-) Numero " + MaterialDocumentId + " " + MaterialDocumentYear, {
					id: "serviceSuccessMessageBox",
					title: this._oText.getText("ChangeGRTitle"),
					textAlignment: "Center",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function () {

						this._reloadApp();

					}.bind(this)
				}
			);

		},
		_reloadApp: function () {

			sap.ui.getCore().getEventBus().publish(
				"EventChannel",
				"GoodsReceiptReload",
				null
			);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("home", true);

		},

		/**
		 * Handle Back navigation
		 * @public
		 */
		onNavigationBackButtonPress: function () {

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this._getQueryParameters(window.location);
			// I dati inseriti andranno persi. Lascia davvero?
			// Message ...

			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
				"I dati inseriti andranno persi. Lascia davvero?", {
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					title: "Attenzione",
					actions: [sap.m.MessageBox.Action.OK, "Annulla"],
					onClose: function (sAction) {
						if (sAction === "OK") {
							if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
								window.history.go(-1);
							} else {
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								oRouter.navTo("App", true);
							}
						}

					}

				}
			);

		},

		/**
		 * Helper to read query parameters (for navigation purpose)
		 * @param {string} oLocation The window.location
		 * @returns {object} The query parameters
		 * @private
		 */
		_getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		}

	});

});