import asyncio
import os
from typing import List

from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from pydantic import BaseModel, EmailStr
from starlette.responses import JSONResponse

load_dotenv()


class EmailSchema(BaseModel):
    email: List[EmailStr]


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
    fm = FastMail(conf)
    await fm.send_message(message)


def send_mail(email: EmailSchema):
    template = """
        <html>
        <body>
            <p>Hi !!!</p>
            <p>Thanks for using fastapi mail, keep using it..!!!</p>
        </body>
        </html>
        """

    message = MessageSchema(
        subject="Fastapi-Mail module",
        recipients=email.dict().get("email"),
        body=template,
        subtype="html",
    )

    asyncio.run(_send_message(message))
    print(message)

    return JSONResponse(status_code=200, content={"message": "email has been sent"})


def send_high_risk_email(recipient_email: str, account_id: str, risk_score: int, threshold: int):
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
        subject=f"High risk alert for account {account_id}",
        recipients=[recipient_email],
        body=template,
        subtype="html",
    )

    asyncio.run(_send_message(message))
    return {"message": "high risk email has been sent"}
