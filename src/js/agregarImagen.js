import { Dropzone } from "dropzone";

const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

Dropzone.options.dropzoneId = {
  dictDefaultMessage: "Drop files here to upload", // Default message
  dictFallbackMessage:
    "Your browser does not support drag'n'drop file uploads.", // Shown when browser is not supported
  dictFallbackText: "Please use the fallback form below to upload your files.", // If fallback is used, shown underneath
  dictFileTooBig:
    "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.", // Shown when file is too big
  dictInvalidFileType: "You can't upload files of this type.", // Shown when file type is not allowed
  dictResponseError: "Server responded with {{statusCode}} code.", // Shown when the server responds with an error
  dictCancelUpload: "Cancel upload", // Text for cancel upload button
  dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?", // Shown when cancelling an upload
  dictRemoveFile: "Remove file", // Text for remove file button
  dictMaxFilesExceeded: "You can not upload any more files.", // Shown when max files exceeded\
  acceptedFiles: ".png,.jpg,.jpeg",
  paramName: "imagen", // The name that will be used to transfer the file
  headers: {
    "CSRF-Token": token,
  }, // dropzone requires a token to be sent
  maxFilesize: 2, // MB
  maxFiles: 1, // How many files
  parallelUploads: 1, // How many files to upload at once
  autoProcessQueue: false, // Auto upload,
  addRemoveLinks: false,
  init: function () {
    const submitButton = document.querySelector("input[type='submit']");
    const deleteButton = document.querySelector("input[type='button']");
    const dropzoneId = this;
    let errorOccurred = false; // Flag to check if an error occurred

    submitButton.addEventListener("click", function () {
      if (dropzoneId.getQueuedFiles().length > 0) {
        dropzoneId.processQueue();
      } else {
        alert("No files to upload!");
      }
    });

    dropzoneId.on("addedfile", function (file) {
      if (
        file.type !== "image/jpeg" &&
        file.type !== "image/png" &&
        file.type !== "image/jpg"
      ) {
        alert("Only images are allowed");
        dropzoneId.removeAllFiles();
        errorOccurred = true; // Set the flag to true

        return;
      }
    });

    dropzoneId.on("error", function () {
      alert("An error occurred");
      dropzoneId.removeAllFiles();
      errorOccurred = true; // Set the flag to true

      return;
    });

    // When upload is complete display the proper message
    dropzoneId.on("queuecomplete", function () {
      if (errorOccurred) {
        // Check the flag
        // If an error occurred, reset the flag and return
        errorOccurred = false;
        return;
      }

      if (dropzoneId.getActiveFiles().length == 0) {
        alert("Files uploaded");

        window.location.href = "/mis-propiedades";
      }
    });

    deleteButton.addEventListener("click", function () {
      if (dropzoneId.getQueuedFiles().length > 0) {
        dropzoneId.removeAllFiles();

        //show an alert
        alert("Files removed");

        return;
      }

      alert("No files to remove");
    });
  },
};
