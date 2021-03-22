sap.ui.define([
	"ch/neo/fiori/mm/grchange/libs/Commons",
	"sap/m/MessageBox"
], function(Commons, MessageBox) {
	"use strict";

	return {
		_parent: null,
		_event: null,

		/**
		 * Initialize the pseudo Attachments Controller
		 * @param {object} iCtrlr The parent controller
		 * @public
		 * */
		init: function(iCtrlr) {
			// the standard file upload input does not allow to insert any custom action before the file explorer popup
			// the workaround is to have a custom file upload input (button) and to set it above the standard
			// to do this, we slightly offset the standard button to the right (custom button is at the right of the standard one)
			if (iCtrlr._oView.byId("UploadCollection-1-uploader")) {
				iCtrlr._oView.byId("UploadCollection-1-uploader").addStyleClass("neoFUHidden");
			}

		},

		/**
		 * Return the fragment name of the attachment "view"
		 * @param {string} iPath The path to the fragment files
		 * @returns {string} The complete path to the Attachment fragment
		 * @public
		 * */
		getTypesFragment: function(iPath) {
			return iPath + "AttachmentTypes";
		},

		/**
		 * Trigger a click on the standard file upload input (which is hidden)
		 * @param {object} iCtrlr The parent controller
		 * @public
		 * */
		triggerClick: function(iCtrlr) {
			
			// Usage of private members of SAPUI5 objects is not allowed
            //  Private members of SAPUI5 objects must never be used in SAP Fiori applications. 
            //  They can be changed by SAPUI5 at anytime and the application might not work anymore.
            
		//	$("#" + iCtrlr._oStandardUploader.sId + "-fu").trigger("click");
		},

		/**
		 * Read a file and get its BASE64 content
		 * @param {object} iFile The file as sent by an HTML file input
		 * @return {Promise} The result of the reading as a Promise
		 * @private
		 * */
		_getBase64File: function(iFile) {
			return new Promise(function(resolve, reject) {
				var reader = new FileReader();
				reader.readAsDataURL(iFile);
				reader.onload = function() {
					resolve(reader.result);
				};
				reader.onerror = function(error) {
					reject(error);
				};
			});
		},

		/**
		 * Handle the change event on File Collection; triggered each time a new file is uploaded from client to web server
		 * @param {object} iCtrlr The parent controller
		 * @param {object} oEvent The source event
		 * @public
		 * */
		onChange: function(iCtrlr, oEvent) {
			// this will need to be updated if anyday we allow multi file upload!
			var file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];

			// needed to bind data to the Promise/Then function
			this._parent = iCtrlr;
			this._file = file;

			// once the BASE64 data is fetch, add the Attachment data to our Attachments collection (within the Model)
			this._getBase64File(file).then(function(data) {
				var today = new Date();

				var oAttachment = {
					"AttachmentId": Commons.createGuid(),
					"FileName": this._file.name,
					"MimeType": this._file.type,
					"FileContent": data,
					// "URL": "",
					// "Deleted": false,
					"CreatedOn": today,
					"CreatedBy": sap.ushell.Container.getService("UserInfo").getId(),
					"ArchiveType": this._parent._archiveType.Description
				};
				var oNewGoodsReceipt = this._parent._oView.getModel("GoodsReceiptDelete");
				var ltAttachments = oNewGoodsReceipt.getProperty("/Files");
				if (!ltAttachments.push) {
					ltAttachments = [];
				}

				ltAttachments.push(oAttachment);

				// sort attachments list according to archive type (1st char) description
				// no sort 20-04-2020...
				//this._sortTable(ltAttachments);
				
				// ltAttachments.sort(function(a, b) {
				// 	var aValue = parseInt(a.ArchiveType.Description.substr(0, 1), 10);
				// 	var bValue = parseInt(b.ArchiveType.Description.substr(0, 1), 10);

				// 	return aValue - bValue;
				// });

				oNewGoodsReceipt.setProperty("/Files", ltAttachments);
				oNewGoodsReceipt.refresh(true);
			}.bind(this));
		},

		/**
		 * sort table with Attachemnts
		 * @param {table} The Attachments
		 * @return {table} The Attachments sorted  
		 * @private
		 * */
		_sortTable: function(table) {

			var table, rows, switching, i, x, y, shouldSwitch;
			switching = true;
			/* Make a loop that will continue until
			no switching has been done: */
			while (switching) {
				// Start by saying: no switching is done:
				switching = false;
				// rows = table.getElementsByTagName("TR");
				/* Loop through all table rows (except the
				first, which contains table headers): */
				for (i = 1; i < (table.length - 1); i++) {
					// Start by saying there should be no switching:
					shouldSwitch = false;
					/* Get the two elements you want to compare,
					one from current row and one from the next: */
					x = table[i].FileName;
					y = table[i + 1].FileName;
					// Check if the two rows should switch place:
					if (x.toLowerCase() > y.toLowerCase()) {
						// I so, mark as a switch and break the loop:
						shouldSwitch = true;
						break;
					}
				}
				if (shouldSwitch) {
					/* If a switch has been marked, make the switch
					and mark that a switch has been done: */
					table[i].insertBefore(table[i + 1], table[i]);
					switching = true;
				}
			}

			return table;

		},

		/**
		 * Handle the delete event on File Collection; triggered each time a file is deleted from the list (after confirmation)
		 * @param {object} iCtrlr The parent controller
		 * @param {object} oEvent The source event
		 * @public
		 * */
		onDelete: function(iCtrlr, oEvent) {
			// using the FileId, search for the Attachment to delete from the Model
			var oGoodsReceiptDelete = iCtrlr._oView.getModel("GoodsReceiptDelete");
			var ltAttachments = oGoodsReceiptDelete.getProperty("/Files");

			for (var i = 0; i < ltAttachments.length; i++) {
				var attachment = ltAttachments[i];
				if (attachment.AttachmentId === oEvent.getParameter("documentId")) {

					attachment.Deleted = true;
					ltAttachments.splice(i, 1);
					oGoodsReceiptDelete.setProperty("/Files", ltAttachments);
				 	oGoodsReceiptDelete.refresh(true);
					return;
				}
			}
		},

		/**
		 * Handle the event when the upload file type is not allowed
		 * @param {object} iCtrlr The parent controller
		 * @param {object} oEvent The source event
		 * @public
		 * */
		onTypeMissmatch: function(iCtrlr, oEvent) {
			var oI18n = iCtrlr.getModel("i18n").getResourceBundle();
			var errorTitle = oI18n.getText("Error");
			var errorMessage = oI18n.getText("AttachWrongType", [oEvent.getParameter("files")[0].name]);

			MessageBox.show(
				errorMessage, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: errorTitle,
					actions: [sap.m.MessageBox.Action.CLOSE]
				});
		}
	};

});