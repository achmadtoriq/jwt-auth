const { google } = require("googleapis");
const fs = require("fs");

const Gallery = async (req, res) => {
  // Load client secrets from a local file
  fs.readFile("./config/credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);

    // Authorize a client with credentials, then call the Google Drive API
    authorize(JSON.parse(content), listFiles);
  });
};

// Create an OAuth2 client with the given credentials
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token
  fs.readFile("./config/token.json", (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

// Get and store new token after prompting user to authorize
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  console.log("Authorize this app by visiting this URL:", authUrl);
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile("./config/token.json", JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log("Token stored to token.json");
      });
      callback(oAuth2Client);
    });
  });
}

// Call the Drive API to get a list of files
async function listFiles(auth) {
  const folderId = "16pKGs0YyE62n9bceEISV8TQhTndln_h_";
  const drive = google.drive({ version: "v3", auth });
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name)",
      pageSize: 10,
    });

    const files = res.data.files;
    if (files.length) {
      console.log("Files in the folder:")
      files.forEach((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log("No files found in the folder.");
    }
  } catch (err) {
    console.error("Error listing files:", err);
  }
}

module.exports = Gallery;
