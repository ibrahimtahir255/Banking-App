import asyncio
import os
from typing import List

from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from pydantic import BaseModel, EmailStr
from starlette.responses import JSONResponse

# Load environment variables from the project .env file so mail credentials are not hard-coded.
load_dotenv()


class EmailSchema(BaseModel):
    # Expected request payload for sending a general email.
    email: List[EmailStr]


# SMTP configuration used by FastAPI-Mail.
# MAIL_USERNAME and MAIL_FROM are the sender-side values used to authenticate and identify the mail account.
# The actual recipient is supplied at send time in the message recipients list.
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", ""),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def _send_message(message: MessageSchema):
    # Build the mail client from the shared SMTP config and send the prepared message.
    fm = FastMail(conf)
    await fm.send_message(message)


def send_mail(email: EmailSchema):
    # Generic email helper for sending a simple HTML message to one or more recipients.
    template = """
        <html>
        <body>
            <p>Hi !!!</p>
            <p>Thanks for using fastapi mail, keep using it..!!!</p>
        </body>
        </html>
        """

    message = MessageSchema(
        # Subject line shown in the recipient's inbox.
        subject="Fastapi-Mail module",
        # Recipients are supplied from the request payload.
        recipients=email.dict().get("email"),
        body=template,
        subtype="html",
    )

    # Run the async mail send from a synchronous function so it can be called from normal app code.
    asyncio.run(_send_message(message))
    print(message)

    return JSONResponse(status_code=200, content={"message": "email has been sent"})


def send_high_risk_email(recipient_email: str, account_id: str, risk_score: int, threshold: int):
    # Send a targeted alert to the account owner when a risky transaction or login pushes
    # the score above the configured threshold.
    template = f"""
        <html>
        <body>
            <p>High-risk alert for account {account_id}</p>
            <p>The current risk score is {risk_score}, which has reached the threshold of {threshold}.</p>
            <p>Please review the account activity promptly.</p>
        </body>
        </html>
        """

    message = MessageSchema(
        # The alert subject identifies the account involved.
        subject=f"High risk alert for account {account_id}",
        # The recipient is the account owner's email address, supplied by the risk service.
        recipients=[recipient_email],
        body=template,
        subtype="html",
    )

    asyncio.run(_send_message(message))
    return {"message": "high risk email has been sent"}
