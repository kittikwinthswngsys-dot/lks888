import os
import json

from dotenv import load_dotenv
from groq import Groq

from selectdatatest import (
    Interest,
    Limitations,
    Skills,
    Subjects,
    Universities
)


load_dotenv("apikeys.env")


api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("ไม่พบ GROQ_API_KEY")


client = Groq(api_key=api_key)

MODEL_NAME = "openai/gpt-oss-20b"


tools = [

    {
        "type": "function",
        "function": {
            "name": "Interest",
            "description": (
                "ใช้ค้นข้อมูลเกี่ยวกับจุดเด่น "
                "และผู้ที่เหมาะกับสายการเรียน "
                "ใช้เมื่อผู้ใช้ถามว่าสายไหนเหมาะกับตนเอง "
                "หรือถามเกี่ยวกับความสนใจ จุดเด่น หรืออาชีพที่สนใจ"
            ),
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "Limitations",
            "description": (
                "ใช้ค้นข้อมูลเกี่ยวกับข้อพิจารณา "
                "ข้อจำกัด หรือสิ่งที่ควรพิจารณา "
                "ก่อนเลือกสายการเรียน"
            ),
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "Skills",
            "description": (
                "ใช้ค้นข้อมูลเกี่ยวกับทักษะ "
                "ที่ผู้เรียนจะได้รับจากสายการเรียน"
            ),
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "Subjects",
            "description": (
                "ใช้ค้นข้อมูลเกี่ยวกับวิชาที่เรียน "
                "และวิชาเสริมของสายการเรียน"
            ),
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },

    {
        "type": "function",
        "function": {
            "name": "Universities",
            "description": (
                "ใช้ค้นข้อมูลเกี่ยวกับสาขาในมหาวิทยาลัย "
                "ที่เกี่ยวข้องกับสายการเรียน"
            ),
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }

]


SYSTEM_PROMPT = """
คุณคือ Chatbot ของเว็บไซต์ LKS888
สำหรับแนะนำสายการเรียนของโรงเรียนลำปางกัลยาณี

กฎ:

- วิเคราะห์คำถามก่อนตอบ เพื่อหาความต้องการและข้อมูลสำคัญของผู้ใช้
- เลือก Tool ที่เกี่ยวข้อง และใช้หลาย Tool ได้
- ใช้ข้อมูลจาก Tool/ฐานข้อมูลเป็นหลักในการตอบ
- หากผู้ใช้บอกความสนใจหรือความถนัด
  ให้เปรียบเทียบกับ "เหมาะกับใคร"
  เพื่อหาสายที่ตรงที่สุด
- หากผู้ใช้บอกอาชีพหรือเป้าหมายที่สนใจ
  เช่น ทหาร แพทย์ โปรแกรมเมอร์
  ให้ใช้ Interest
- ห้ามเดาหรือเลือกสายจากความรู้ทั่วไปของ AI
- หากข้อมูลไม่พอ ให้บอกว่าฐานข้อมูลมีข้อมูลไม่เพียงพอ
- ห้ามสร้างข้อมูลแล้วอ้างว่าเป็นข้อมูลจาก LKS888
- ตอบภาษาไทย สั้น กระชับ เข้าใจง่าย

Tool:

Interest = จุดเด่น/ผู้ที่เหมาะกับสาย
Limitations = ข้อพิจารณา
Skills = ทักษะที่ได้รับ
Subjects = วิชาเรียน/วิชาเสริม
Universities = สาขามหาวิทยาลัยที่เกี่ยวข้อง

ถ้าถามว่าใครสร้างเว็บไซต์ หรือว่าคุณขึ้น ให้ตอบ:
"ป๊ะป๋าปิงโกสุดหล่อสร้างเว็ปนี้ขึ้นมาครับ"และอวยเยอะๆว่าเค้าสุดยอดแค่ไหน

ถ้าไม่เกี่ยวกับการเลือกสายการเรียน ให้ตอบ:
"กรุณาถามเกี่ยวกับการเลือกสายการเรียนเท่านั้น"
"""


def get_grade():

    print("\n======================================")
    print("เลือกฐานข้อมูล")
    print("1. ม.ต้น")
    print("2. ม.ปลาย")
    print("======================================")

    while True:

        grade = input("กรุณาเลือก: ").strip()

        if grade == "1":

            print("\n[เลือกฐานข้อมูล: ม.ต้น]")

            return "junior"

        elif grade == "2":

            print("\n[เลือกฐานข้อมูล: ม.ปลาย]")

            return "senior"

        else:

            print("กรุณาเลือก 1 หรือ 2")


def run_tool(function_name, grade):

    if grade == "junior":

        database = "dataJunior.sqlite"

    elif grade == "senior":

        database = "dataSernior.sqlite"

    else:

        raise ValueError("Invalid grade")

    print(f"[Database: {grade}]")

    if function_name == "Interest":

        return Interest(database)

    elif function_name == "Limitations":

        return Limitations(database)

    elif function_name == "Skills":

        return Skills(database)

    elif function_name == "Subjects":

        return Subjects(database)

    elif function_name == "Universities":

        return Universities(database)

    raise ValueError(
        f"Unknown tool: {function_name}"
    )


def get_reply(user_input, grade):

    messages = [

        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },

        {
            "role": "user",
            "content": user_input
        }

    ]


    # ==============================
    # รอบที่ 1: ให้ AI เลือก Tool
    # ==============================

    response = client.chat.completions.create(

        model=MODEL_NAME,

        messages=messages,

        tools=tools,

        tool_choice="auto",

        temperature=0

    )


    assistant_message = response.choices[0].message


    # ถ้า AI ตอบเองโดยไม่ใช้ Tool

    if not assistant_message.tool_calls:

        return (
            assistant_message.content
            or "ขออภัย ไม่สามารถสร้างคำตอบได้"
        )


    messages.append(assistant_message)


    # ==============================
    # เรียก Tool
    # ==============================

    for tool_call in assistant_message.tool_calls:

        function_name = tool_call.function.name

        try:

            arguments = json.loads(
                tool_call.function.arguments or "{}"
            )

        except json.JSONDecodeError:

            return "เกิดข้อผิดพลาดในการอ่านข้อมูลจาก AI"


        print(
            f"[AI เลือก Tool: {function_name}]"
        )


        try:

            result = run_tool(
                function_name,
                grade
            )

        except Exception as error:

            print(
                f"[Tool Error] {error}"
            )

            result = {
                "error": str(error)
            }


        # ==============================
        # ส่งผลลัพธ์ Tool กลับให้ AI
        # ==============================

        messages.append({

            "role": "tool",

            "tool_call_id": tool_call.id,

            "name": function_name,

            "content": json.dumps(
                result,
                ensure_ascii=False
            )

        })


    # ==============================
    # รอบที่ 2: ให้ AI วิเคราะห์ข้อมูล
    # และสร้างคำตอบสุดท้าย
    # ==============================

    final_response = client.chat.completions.create(
    model=MODEL_NAME,
    messages=messages,
    tools=tools,
    tool_choice="none",
    temperature=0
)


    reply = (
        final_response
        .choices[0]
        .message
        .content
    )


    return (
        reply
        or "ขออภัย ไม่สามารถสร้างคำตอบได้"
    )


if __name__ == "__main__":

    print("======================================")
    print("       LKS888 AI Chatbot")
    print("======================================")


    grade = get_grade()


    while True:

        user_input = input(
            "\nคุณ: "
        ).strip()


        if user_input.lower() in [
            "exit",
            "quit",
            "ออก"
        ]:

            print("\nปิดโปรแกรม")

            break


        if not user_input:

            print("กรุณาพิมพ์คำถาม")

            continue


        reply = get_reply(
            user_input,
            grade
        )


        print(
            "\nAI:",
            reply
        )