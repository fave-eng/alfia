/* Speakout A1 · Grammar topics. Update status after each lesson. */
window.GRAMMAR_DATA = [
  {
    "id": "grammar-be-i-you",
    "order": 1,
    "title": "To be: I am / you are",
    "level": "A1",
    "status": "available",
    "publishedAt": "2026-10-15",
    "linkedLessonId": "lesson-1",
    "page": "grammar-topic.html?id=grammar-be-i-you",
    "passed": false,
    "attempts": 0,
    "lockOnPass": false,
    "revealAnswersOnError": false,
    "explanation": "В английском предложении обычно нужен глагол. Когда говорим, кто мы, где находимся или откуда мы родом, в начале обучения используем be. С I он превращается в am, с you — в are. Сравни: «Я студент» → I am a student (нельзя I a student).",
    "formula": "I + am + …  |  You + are + …  |  Am I + …?  |  Are you + …?",
    "glanceCards": [
      {
        "icon": "+",
        "label": "Утверждение",
        "hint": "кто / откуда / где",
        "pattern": "I am / You are",
        "example": "I am from Ufa. You are a student."
      },
      {
        "icon": "−",
        "label": "Отрицание",
        "hint": "не являюсь / не находишься",
        "pattern": "I am not / You are not",
        "example": "I am not from London. You are not late."
      },
      {
        "icon": "?",
        "label": "Вопрос",
        "hint": "am / are перед человеком",
        "pattern": "Am I…? / Are you…?",
        "example": "Are you from Russia?"
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Forms"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-mistakes",
        "title": "Mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. I → am",
        "text": "После I употребляем am. В разговоре I am часто сокращается до I’m.",
        "example": "I am Alfiya. → I’m Alfiya."
      },
      {
        "title": "2. You → are",
        "text": "После you употребляем are. You are можно сократить до you’re.",
        "example": "You are from Spain. → You’re from Spain."
      },
      {
        "title": "3. Для отрицания: not",
        "text": "Добавь not сразу после am/are. Варианты you aren’t и you’re not оба правильные. В стандартном английском I amn’t не употребляется.",
        "example": "I’m not a teacher. You aren’t late."
      },
      {
        "title": "4. Для вопроса меняем порядок",
        "text": "В вопросе am/are ставится перед I/you. Не используй do/does с to be.",
        "example": "You are a student. → Are you a student?"
      },
      {
        "title": "5. Короткий ответ",
        "text": "В положительном ответе повторяем am/are; в отрицательном добавляем not. С Yes, I am сокращение I’m не используется.",
        "example": "Are you Russian? — Yes, I am. / No, I’m not."
      }
    ],
    "tables": [
      {
        "title": "Positive, negative, questions",
        "headers": [
          "Purpose",
          "I",
          "You"
        ],
        "rows": [
          [
            "+ Statement",
            "I am ready. / I’m ready.",
            "You are ready. / You’re ready."
          ],
          [
            "− Negative",
            "I am not ready. / I’m not ready.",
            "You are not ready. / You aren’t ready."
          ],
          [
            "? Question",
            "Am I ready?",
            "Are you ready?"
          ]
        ]
      },
      {
        "title": "Short answers",
        "headers": [
          "Question",
          "Yes",
          "No"
        ],
        "rows": [
          [
            "Am I late?",
            "Yes, you are.",
            "No, you aren’t."
          ],
          [
            "Are you from Ufa?",
            "Yes, I am.",
            "No, I’m not."
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Real conversations",
        "items": [
          "A: Hi! I’m Alfiya. B: Hello! I’m Anna.",
          "A: Are you from Russia? B: Yes, I am.",
          "A: Are you a student? B: No, I’m not. I’m a teacher."
        ]
      }
    ],
    "commonMistakes": [
      "❌ I from Ufa. → ✅ I am from Ufa. (нельзя пропускать be).",
      "❌ You is a student. → ✅ You are a student.",
      "❌ Are from Russia you? → ✅ Are you from Russia?",
      "❌ Yes, I’m. → ✅ Yes, I am. (в коротком положительном ответе).",
      "❌ I amn’t late. → ✅ I’m not late."
    ],
    "exercises": [
      {
        "id": "g-positive",
        "type": "exercise",
        "title": "Choose am or are",
        "difficulty": "Start here",
        "instructions": "Choose the correct form.",
        "items": [
          {
            "id": "1",
            "prompt": "I ___ from Russia.",
            "input": "select",
            "options": [
              "am",
              "are"
            ],
            "answer": 0
          },
          {
            "id": "2",
            "prompt": "You ___ a student.",
            "input": "select",
            "options": [
              "am",
              "are"
            ],
            "answer": 1
          },
          {
            "id": "3",
            "prompt": "I ___ happy.",
            "input": "select",
            "options": [
              "am",
              "are"
            ],
            "answer": 0
          },
          {
            "id": "4",
            "prompt": "You ___ from London.",
            "input": "select",
            "options": [
              "am",
              "are"
            ],
            "answer": 1
          }
        ]
      },
      {
        "id": "g-negative",
        "type": "exercise",
        "title": "Make a negative sentence",
        "difficulty": "Next step",
        "instructions": "Write the missing word only.",
        "items": [
          {
            "id": "1",
            "prompt": "I ___ not from Spain.",
            "input": "text",
            "answer": "am"
          },
          {
            "id": "2",
            "prompt": "You ___ not late.",
            "input": "text",
            "answer": "are"
          },
          {
            "id": "3",
            "prompt": "I ___ not a doctor.",
            "input": "text",
            "answer": "am"
          }
        ]
      },
      {
        "id": "g-questions",
        "type": "exercise",
        "title": "Questions and short answers",
        "difficulty": "Use it",
        "instructions": "Choose the correct option.",
        "items": [
          {
            "id": "1",
            "prompt": "___ you a student?",
            "input": "select",
            "options": [
              "Am",
              "Are"
            ],
            "answer": 1
          },
          {
            "id": "2",
            "prompt": "Are you from Ufa? — Yes, I ___.",
            "input": "select",
            "options": [
              "’m",
              "am",
              "are"
            ],
            "answer": 1
          },
          {
            "id": "3",
            "prompt": "___ I late?",
            "input": "select",
            "options": [
              "Am",
              "Are"
            ],
            "answer": 0
          },
          {
            "id": "4",
            "prompt": "Are you a teacher? — No, I’m ___.",
            "input": "select",
            "options": [
              "are",
              "not",
              "am"
            ],
            "answer": 1
          }
        ]
      }
    ]
  }
];
