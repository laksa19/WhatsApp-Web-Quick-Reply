# WhatsApp-Web-Quick-Reply
WhatsApp Web Quick Reply


## Installation

1. [Tampermonkey](https://www.tampermonkey.net/)
2. Install [user script](https://github.com/laksa19/WhatsApp-Web-Quick-Reply/raw/refs/heads/main/whatsapp_web_quick_reply.user.js)
3. Enable Developer mode in Chrome / Chrome base browser ![image](https://github.com/user-attachments/assets/f9cade35-93b4-4147-9ae6-eda2383d91cd)


## How to use.


### Edi textlist variable

```js
const quickReplyConfig = [
        {
            text: "/hi",
            expand: "Hi firend🙋‍♂️"
        },
        {
            text: "test",
            expand: "this is a test message,\n you can ignore it."
        },
    ]
```

Note: add ```\n``` for new line
