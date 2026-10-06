from flask import Flask, render_template, request, jsonify

from chatbot import get_reply


app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = str(
        data.get("message", "")
    ).strip()
    grade = str(
        data.get("grade", "")
    ).strip().lower()
    if not message:

        return jsonify({
            "reply": "กรุณาพิมพ์ข้อความ"
        }), 400
    if grade not in ["junior", "senior"]:

        return jsonify({
            "reply": "กรุณาเลือกระดับการศึกษา"
        }), 400
    try:

        reply = get_reply(
            message,
            grade
        )

    except Exception:

        app.logger.exception("chat error")

        return jsonify({
            "reply": "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง"
        }), 500
    return jsonify({
        "reply": reply
    })

if __name__ == "__main__":

    app.run(debug=True)