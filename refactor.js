const fs = require('fs');

const code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const startMatch = "      // Auto-Reply Logic";
const startIdx = code.indexOf(startMatch);

const endPattern = /console\.error\(`\[WA\] Webhook failed for \$\{tenantId\}:`, error\);\s*}\s*}/;
const match = code.match(endPattern);

if(startIdx === -1 || !match) {
  console.error("Not found");
  process.exit(1);
}

const endIdx = match.index + match[0].length;

const extracted = code.substring(startIdx, endIdx);

let extractedStr = extracted
  .replace(/msg\.pushName/g, 'pushName')
  .replace(/msg\.messageTimestamp \? new Date\(Number\(msg\.messageTimestamp\) \* 1000\) \: /g, 'msgTimestamp ? new Date(Number(msgTimestamp) * 1000) : ');

const functionDecl = `\nexport async function processAutoReplyAndAI(tenantId: string, deviceId: string, phoneNumber: string, incomingText: string, contact: any, pushName?: string | null, msgTimestamp?: string | number | null, mediaUrl: string | null = null, mediaType: string | null = null) {\n` + extractedStr + `\n}\n`;

const replacementCall = `      await processAutoReplyAndAI(tenantId, deviceId, phoneNumber, incomingText, contact, msg.pushName, msg.messageTimestamp, mediaUrl, mediaType);`;

const newCode = code.substring(0, startIdx) + replacementCall + code.substring(endIdx) + functionDecl;

fs.writeFileSync('src/lib/whatsapp.ts', newCode);
console.log("Refactoring complete");
