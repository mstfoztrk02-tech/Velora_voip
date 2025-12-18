# Asterisk Dialplan Configuration for Platinum Auto-Dialer

This document provides the Asterisk dialplan configuration required for Velora Platinum auto-dialer campaigns.

## Overview

The dialplan handles:
- Playing TTS audio files to called parties
- Collecting DTMF input (optional)
- Logging call results
- Handling hangup causes

---

## Prerequisites

1. **TTS Audio Files Location**
   - Audio files are stored in: `/var/lib/asterisk/sounds/tts/`
   - Format: `{audioId}.mp3` or `{audioId}.wav`
   - Recommended: WAV 8kHz mono for best compatibility

2. **Issabel/FreePBX Version**
   - Asterisk 13+ or 16+
   - AMI (Asterisk Manager Interface) enabled

---

## Dialplan Configuration

### Option 1: Add to `extensions_custom.conf`

Location: `/etc/asterisk/extensions_custom.conf`

```ini
[velora-platinum-dialer]
; Velora Platinum Auto-Dialer Context
; Called from AMI Originate action

exten => s,1,NoOp(=== Velora Platinum Call Start ===)
    same => n,Set(CAMPAIGN_ID=${CUT(CHANNEL,-,1)})
    same => n,Set(AUDIO_ID=${AUDIO_ID})  ; Passed from AMI Variable
    same => n,Set(CALL_ID=${UNIQUEID})

    ; Answer the call
    same => n,Answer()
    same => n,Wait(0.5)

    ; Play TTS audio
    same => n,NoOp(Playing TTS: ${AUDIO_ID})
    same => n,Playback(/var/lib/asterisk/sounds/tts/${AUDIO_ID})

    ; Optional: Collect DTMF (1 digit, 5 second timeout)
    same => n,Read(DTMF_INPUT,beep,1,,3,5)
    same => n,NoOp(DTMF Input: ${DTMF_INPUT})

    ; Set channel variable for CDR
    same => n,Set(CDR(userfield)=${CAMPAIGN_ID}|${AUDIO_ID}|${DTMF_INPUT})

    ; Hangup
    same => n,Hangup()

exten => h,1,NoOp(=== Velora Platinum Call End ===)
    same => n,NoOp(Call Duration: ${CDR(billsec)} seconds)
    same => n,NoOp(Hangup Cause: ${HANGUPCAUSE})
    same => n,NoOp(Disposition: ${CDR(disposition)})
```

---

### Option 2: Add to `extensions.conf`

If you don't have `extensions_custom.conf`, add to `/etc/asterisk/extensions.conf`:

```ini
#include extensions_velora.conf
```

Then create `/etc/asterisk/extensions_velora.conf` with the content from Option 1.

---

## Reload Dialplan

After adding the configuration:

```bash
# SSH to Issabel server
ssh admin@185.8.12.117

# Reload dialplan
asterisk -rx "dialplan reload"

# Verify context loaded
asterisk -rx "dialplan show velora-platinum-dialer"
```

---

## AMI Originate Example

When calling from Node.js API (`/api/issabel/originate`):

```javascript
{
  "number": "905551234567",
  "trunk": "SIP/trunk",
  "context": "velora-platinum-dialer",
  "extension": "s",
  "variables": {
    "AUDIO_ID": "abc123-1234567890",
    "CAMPAIGN_ID": "camp-uuid-here"
  }
}
```

---

## TTS File Sync

If TTS files are generated on Vercel (serverless), you need to sync them to Issabel:

### Method 1: rsync (Recommended)

```bash
# From Vercel/Node server
rsync -avz /tmp/tts-assets/ admin@185.8.12.117:/var/lib/asterisk/sounds/tts/
```

### Method 2: SCP

```bash
scp /tmp/tts-assets/*.wav admin@185.8.12.117:/var/lib/asterisk/sounds/tts/
```

### Method 3: HTTP Streaming (Alternative)

Modify dialplan to stream from HTTP:

```ini
exten => s,1,Answer()
    same => n,Playback(https://your-vercel-app.vercel.app/api/tts/${AUDIO_ID})
```

**Note:** Requires `res_http_media_cache` module in Asterisk 18+.

---

## CDR Logging

Call records are stored in Asterisk CDR. To query:

```bash
# Via CLI
asterisk -rx "cdr show"

# Via Database (if using cdr_mysql)
mysql -u root -p asteriskcdrdb
SELECT * FROM cdr WHERE userfield LIKE '%camp-uuid-here%';
```

CDR Fields:
- `userfield`: Contains `CAMPAIGN_ID|AUDIO_ID|DTMF_INPUT`
- `billsec`: Call duration in seconds
- `disposition`: ANSWERED, NO ANSWER, BUSY, FAILED
- `hangupcause`: Numeric hangup cause

---

## Advanced: DTMF Menu

For interactive campaigns (press 1 for sales, 2 for support):

```ini
exten => s,1,Answer()
    same => n,Playback(/var/lib/asterisk/sounds/tts/${AUDIO_ID})
    same => n,Background(beep)
    same => n,WaitExten(5)

exten => 1,1,NoOp(User pressed 1 - Sales)
    same => n,Set(CDR(userfield)=${CAMPAIGN_ID}|${AUDIO_ID}|1)
    same => n,Dial(SIP/sales-queue)
    same => n,Hangup()

exten => 2,1,NoOp(User pressed 2 - Support)
    same => n,Set(CDR(userfield)=${CAMPAIGN_ID}|${AUDIO_ID}|2)
    same => n,Dial(SIP/support-queue)
    same => n,Hangup()

exten => t,1,NoOp(Timeout - No input)
    same => n,Hangup()
```

---

## Troubleshooting

### Audio file not found

```bash
# Check file exists
ls -lh /var/lib/asterisk/sounds/tts/

# Check permissions
chmod 644 /var/lib/asterisk/sounds/tts/*.wav
chown asterisk:asterisk /var/lib/asterisk/sounds/tts/*.wav
```

### Dialplan not loading

```bash
# Check syntax
asterisk -rx "dialplan reload"

# View warnings
tail -f /var/log/asterisk/messages
```

### AMI connection issues

```bash
# Check AMI enabled
grep "enabled = yes" /etc/asterisk/manager.conf

# Check AMI user
cat /etc/asterisk/manager.conf | grep -A 10 "\[admin\]"

# Restart Asterisk
systemctl restart asterisk
```

---

## Security Notes

1. **AMI Security**
   - Use strong AMI password
   - Restrict AMI access by IP in `manager.conf`:
     ```ini
     [admin]
     secret = strong-password-here
     deny = 0.0.0.0/0.0.0.0
     permit = YOUR_SERVER_IP/255.255.255.255
     ```

2. **TTS File Storage**
   - Clean up old TTS files regularly
   - Limit storage size (e.g., max 1GB)

3. **Rate Limiting**
   - Limit concurrent calls in campaign (concurrency setting)
   - Respect local regulations (e.g., max calls/hour)

---

## Integration Checklist

- [ ] Dialplan added to Asterisk
- [ ] Dialplan reloaded successfully
- [ ] TTS directory created: `/var/lib/asterisk/sounds/tts/`
- [ ] AMI credentials configured in backend `.env`
- [ ] Test call executed successfully
- [ ] CDR logging verified
- [ ] TTS file sync method chosen
- [ ] Security settings applied

---

For questions or issues, refer to:
- Asterisk Dialplan: https://wiki.asterisk.org/wiki/display/AST/Dialplan
- Issabel Documentation: https://www.issabel.org/
- AMI Reference: https://wiki.asterisk.org/wiki/display/AST/Asterisk+Manager+Interface+%28AMI%29
