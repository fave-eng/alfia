/* Speakout A1 · Grammar topic: lesson 1A. */
window.GRAMMAR_DATA = [
  {
    "id": "grammar-be-i-you",
    "order": 1,
    "title": "Present simple be: I / you",
    "level": "A1",
    "status": "available",
    "publishedAt": "2026-10-15",
    "linkedLessonId": "lesson-1",
    "page": "grammar-topic.html?id=grammar-be-i-you",
    "passed": false,
    "attempts": 0,
    "lockOnPass": true,
    "revealAnswersOnError": false,
    "explanation": "В Lesson 1A мы используем глагол be, чтобы назвать себя, сказать, кто мы по профессии или откуда родом. В английском нельзя просто поставить «я + из + страна»: между I и from обязателен am. Формы I am и you are не взаимозаменяемы.",
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
      },
      {
        "title": "6. Where are you from? и Are you from …?",
        "text": "Where — вопросительное слово, когда страна неизвестна: Where are you from? Если предполагаем конкретную страну и хотим проверить, говорим Are you from Japan? Ответ на второй вопрос: Yes, I am. / No, I’m not.",
        "example": "Where are you from? — I’m from Poland. / Are you from Poland? — No, I’m not."
      },
      {
        "title": "7. a / an перед профессией",
        "text": "Для одной профессии в форме единственного числа обычно нужен неопределённый артикль a или an: a student, a teacher, an artist. Но перед прилагательным национальности артикля нет: I’m French.",
        "example": "I’m a teacher. / I’m Japanese."
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
      "❌ I amn’t late. → ✅ I’m not late.",
      "❌ I’m from Japanese. → ✅ I’m from Japan. / I’m Japanese. (страна и национальность — не одно и то же)"
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
        "title": "Complete the negative sentences",
        "difficulty": "Next step",
        "instructions": "Complete the negative sentences with the correct form of be.",
        "items": [
          {
            "id": "1",
            "prompt": "",
            "input": "gaps",
            "segments": [
              "I ",
              " not from Spain."
            ],
            "answers": [
              "am"
            ]
          },
          {
            "id": "2",
            "prompt": "",
            "input": "gaps",
            "segments": [
              "You ",
              " not late."
            ],
            "answers": [
              "are"
            ]
          },
          {
            "id": "3",
            "prompt": "",
            "input": "gaps",
            "segments": [
              "I ",
              " not a doctor."
            ],
            "answers": [
              "am"
            ]
          },
          {
            "id": "4",
            "prompt": "",
            "input": "gaps",
            "segments": [
              "You ",
              " from Korea."
            ],
            "answers": [
              [
                "aren't",
                "are not"
              ]
            ]
          }
        ]
      },
      {
        "id": "g-questions",
        "type": "exercise",
        "title": "Choose the correct question or short answer",
        "difficulty": "Use it",
        "instructions": "Choose the correct option.",
        "items": [
          {
            "id": "1",
            "prompt": "___ you a student?",
            "input": "single",
            "options": [
              "Am",
              "Are"
            ],
            "answer": 1
          },
          {
            "id": "2",
            "prompt": "Are you from Ufa? — Yes, I ___.",
            "input": "single",
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
            "input": "single",
            "options": [
              "Am",
              "Are"
            ],
            "answer": 0
          },
          {
            "id": "4",
            "prompt": "Are you a teacher? — No, I’m ___.",
            "input": "single",
            "options": [
              "are",
              "not",
              "am"
            ],
            "answer": 1
          }
        ]
      },
      {
        "id": "g-sentence-builder",
        "type": "exercise",
        "title": "Write complete sentences and questions",
        "difficulty": "Challenge",
        "instructions": "Write the complete sentence or question. Use all the words and the correct form of be.",
        "items": [
          {
            "id": "1",
            "prompt": "I / from / Mexico (+)",
            "input": "text",
            "answer": "I’m from Mexico.",
            "acceptedAnswers": [
              "I'm from Mexico.",
              "I am from Mexico."
            ]
          },
          {
            "id": "2",
            "prompt": "you / from / Spain (?)",
            "input": "text",
            "answer": "Are you from Spain?"
          },
          {
            "id": "3",
            "prompt": "I / a student (−)",
            "input": "text",
            "answer": "I'm not a student.",
            "acceptedAnswers": [
              "I'm not a student.",
              "I am not a student."
            ]
          },
          {
            "id": "4",
            "prompt": "where / you / from (?)",
            "input": "text",
            "answer": "Where are you from?"
          }
        ]
      }
    ]
  }
];
