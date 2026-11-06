// Adapted from NordLingo Android; content is independent of the renderer.
const token = (text, label, tone)=>({
        text,
        label,
        tone
    });
const example = (caption, translation, tokens, art)=>({
        caption,
        translation,
        tokens,
        art
    });
const question = (id, sentence, translation, answer, distractors, explanation)=>({
        id,
        sentence,
        translation,
        answer,
        options: [
            answer,
            ...distractors
        ],
        explanation
    });
const mode = (id, label, reminder, examples)=>({
        id,
        label,
        reminder,
        examples
    });
const sentences = [
    {
        id: 'word-order',
        topic: 'Ordinea cuvintelor',
        level: 'A1',
        title: 'Unde stă verbul?',
        subtitle: 'Schimbă forma și observă ordinea.',
        modes: [
            mode('statement', 'Spun ceva', 'În aceste enunțuri, verbul conjugat ocupă poziția a doua. „I dag” este un singur grup.', [
                example('Încep cu persoana', 'Eu beau cafea.', [
                    token('Jeg', 'cine', 'person'),
                    token('drikker', 'verb', 'verb'),
                    token('kaffe.', 'ce')
                ]),
                example('Încep cu timpul', 'Astăzi beau cafea.', [
                    token('I dag', 'când', 'time'),
                    token('drikker', 'verb', 'verb'),
                    token('jeg', 'cine', 'person'),
                    token('kaffe.', 'ce')
                ])
            ]),
            mode('question', 'Întreb', 'În întrebările cu răspuns da/nu, verbul conjugat vine înaintea subiectului: cine face acțiunea.', [
                example('O întrebare cu da sau nu', 'Bei cafea?', [
                    token('Drikker', 'verb', 'verb'),
                    token('du', 'cine', 'person'),
                    token('kaffe?', 'ce')
                ], 'coffee')
            ]),
            mode('negative', 'Spun nu', 'În acest enunț, ikke se așază după verbul conjugat.', [
                example('Neg o acțiune', 'Eu nu beau cafea.', [
                    token('Jeg', 'cine', 'person'),
                    token('drikker', 'verb', 'verb'),
                    token('ikke', 'nu', 'focus'),
                    token('kaffe.', 'ce')
                ], 'coffee')
            ])
        ],
        questions: [
            question('order-time', 'I dag ___ kaffe.', 'Astăzi beau cafea.', 'drikker jeg', [
                'jeg drikker',
                'drikker'
            ], 'După grupul I dag urmează verbul, apoi persoana: drikker jeg.'),
            question('order-question', '___ du kaffe?', 'Bei cafea?', 'Drikker', [
                'Drikke',
                'Å drikke'
            ], 'Întrebarea cu da/nu începe cu verbul conjugat: Drikker du …?'),
            question('order-negative', 'Jeg ___ kaffe.', 'Eu nu beau cafea.', 'drikker ikke', [
                'ikke drikker',
                'drikke ikke'
            ], 'În acest enunț, ikke vine după drikker.')
        ]
    },
    {
        id: 'two-verbs',
        topic: 'Ordinea cuvintelor',
        level: 'A1',
        title: 'Când ai două verbe',
        subtitle: 'Primul verb se schimbă. Al doilea rămâne la infinitiv.',
        modes: [
            mode('statement', 'Spun ceva', 'După kan folosim infinitivul fără å: kan komme.', [
                example('Spun ce pot face', 'Pot veni mâine.', [
                    token('Jeg', 'cine', 'person'),
                    token('kan', 'verb', 'verb'),
                    token('komme', 'infinitiv', 'focus'),
                    token('i morgen.', 'când', 'time')
                ])
            ]),
            mode('question', 'Întreb', 'În întrebarea cu da/nu, persoana stă între kan și komme.', [
                example('Întreb dacă este posibil', 'Poți veni mâine?', [
                    token('Kan', 'verb', 'verb'),
                    token('du', 'cine', 'person'),
                    token('komme', 'infinitiv', 'focus'),
                    token('i morgen?', 'când', 'time')
                ])
            ]),
            mode('negative', 'Spun nu', 'În acest enunț, ikke stă între verbul modal și infinitiv.', [
                example('Spun că nu pot', 'Nu pot veni.', [
                    token('Jeg', 'cine', 'person'),
                    token('kan', 'verb', 'verb'),
                    token('ikke', 'nu', 'focus'),
                    token('komme.', 'infinitiv')
                ])
            ])
        ],
        questions: [
            question('modal-infinitive', 'Jeg kan ___ i morgen.', 'Pot veni mâine.', 'komme', [
                'kommer',
                'å komme'
            ], 'După kan folosim infinitivul fără å.'),
            question('modal-question', '___ komme i morgen?', 'Poți veni mâine?', 'Kan du', [
                'Du kan',
                'Kan'
            ], 'Întrebarea începe cu Kan du …?'),
            question('modal-negative', 'Jeg ___ komme.', 'Nu pot veni.', 'kan ikke', [
                'ikke kan',
                'kan å'
            ], 'În enunțul principal, ikke urmează după kan.')
        ]
    },
    {
        id: 'question-words',
        topic: 'Întrebări',
        level: 'A1',
        title: 'Ce vrei să afli?',
        subtitle: 'Alege informația de care ai nevoie.',
        modes: [
            mode('where', 'Unde?', 'Hvor întreabă despre loc. Aici urmează verbul, apoi persoana.', [
                example('Întreb despre loc', 'Unde locuiești?', [
                    token('Hvor', 'unde', 'focus'),
                    token('bor', 'verb', 'verb'),
                    token('du?', 'cine', 'person')
                ])
            ]),
            mode('when', 'Când?', 'Når întreabă despre timp. Aici urmează verbul, apoi persoana.', [
                example('Întreb despre timp', 'Când vii?', [
                    token('Når', 'când', 'focus'),
                    token('kommer', 'verb', 'verb'),
                    token('du?', 'cine', 'person')
                ])
            ]),
            mode('who', 'Cine?', 'Când hvem este chiar subiectul, el ocupă locul persoanei: Hvem kommer?', [
                example('Întreb cine face acțiunea', 'Cine vine?', [
                    token('Hvem', 'cine', 'person'),
                    token('kommer?', 'verb', 'verb')
                ])
            ])
        ],
        questions: [
            question('ask-where', '___ bor du?', 'Unde locuiești?', 'Hvor', [
                'Når',
                'Hvem'
            ], 'Pentru loc folosim Hvor.'),
            question('ask-when', '___ kommer du?', 'Când vii?', 'Når', [
                'Hvor',
                'Hvem'
            ], 'Pentru timp folosim Når.'),
            question('ask-who', '___ kommer?', 'Cine vine?', 'Hvem', [
                'Når',
                'Hvor'
            ], 'Hvem este persoana despre care întrebăm.')
        ]
    },
    {
        id: 'subordinate',
        topic: 'Propoziții legate',
        level: 'A2',
        title: 'Unde pui „ikke”?',
        subtitle: 'Observă diferența după at sau fordi.',
        modes: [
            mode('compare', 'Compară', 'În subordonata introdusă aici prin at, ikke vine înaintea verbului conjugat.', [
                example('Propoziție principală', 'El nu vine.', [
                    token('Han', 'cine', 'person'),
                    token('kommer', 'verb', 'verb'),
                    token('ikke.', 'nu', 'focus')
                ]),
                example('După „Jeg vet …”', 'Știu că el nu vine.', [
                    token('at', 'că'),
                    token('han', 'cine', 'person'),
                    token('ikke', 'nu', 'focus'),
                    token('kommer.', 'verb', 'verb')
                ])
            ]),
            mode('because', 'Pentru că', 'Și după fordi, în această subordonată, ikke precedă verbul conjugat.', [
                example('După „Jeg blir hjemme …”', 'Rămân acasă pentru că nu sunt sănătos.', [
                    token('fordi', 'pentru că'),
                    token('jeg', 'cine', 'person'),
                    token('ikke', 'nu', 'focus'),
                    token('er', 'verb', 'verb'),
                    token('frisk.', 'cum')
                ])
            ])
        ],
        questions: [
            question('sub-at', 'Jeg vet at han ___ i dag.', 'Știu că el nu vine astăzi.', 'ikke kommer', [
                'kommer ikke',
                'ikke komme'
            ], 'După at, în această subordonată, ikke vine înaintea lui kommer.'),
            question('sub-fordi', 'Jeg blir hjemme fordi jeg ___ frisk.', 'Rămân acasă pentru că nu sunt sănătos.', 'ikke er', [
                'er ikke',
                'ikke være'
            ], 'În subordonata cu fordi, ordinea este jeg ikke er.'),
            question('sub-main', 'Han ___ i dag.', 'El nu vine astăzi.', 'kommer ikke', [
                'ikke kommer',
                'komme ikke'
            ], 'În enunțul principal, ikke vine după verbul conjugat.')
        ]
    }
];
const useful = [
    {
        id: 'much-many',
        topic: 'Cantitate',
        level: 'A1',
        title: 'Mult sau multe?',
        subtitle: 'Alegi după lucrul despre care vorbești.',
        modes: [
            mode('compare', 'Compară', 'mye pentru cantități nenumărabile; mange pentru lucruri numărabile, la plural.', [
                example('Cantitate', 'multă cafea', [
                    token('mye', 'multă', 'focus'),
                    token('kaffe', 'cafea')
                ], 'coffee'),
                example('Lucruri pe care le numeri', 'multe cărți', [
                    token('mange', 'multe', 'focus'),
                    token('bøker', 'cărți')
                ], 'books')
            ]),
            mode('mye', 'mye', 'Aici vorbim despre cantitatea de cafea, fără să numărăm cești.', [
                example('Cantitate', 'Beau multă cafea.', [
                    token('Jeg'),
                    token('drikker'),
                    token('mye', 'cantitate', 'focus'),
                    token('kaffe.')
                ], 'coffee')
            ]),
            mode('mange', 'mange', 'Cărțile pot fi numărate. Folosim mange cu forma de plural bøker.', [
                example('Lucruri numărabile', 'Am multe cărți.', [
                    token('Jeg'),
                    token('har'),
                    token('mange', 'număr', 'focus'),
                    token('bøker.')
                ], 'books')
            ])
        ],
        questions: [
            question('much-water', 'Hun drikker ___ vann.', 'Ea bea multă apă.', 'mye', [
                'mange',
                'få'
            ], 'Vann exprimă aici o cantitate nenumărabilă: mye vann.'),
            question('many-books', 'Jeg har ___ bøker.', 'Am multe cărți.', 'mange', [
                'mye',
                'lite'
            ], 'Bøker este un substantiv numărabil la plural.'),
            question('many-cups', 'Vi har ___ kopper.', 'Avem multe cești.', 'mange', [
                'mye',
                'litt'
            ], 'Ceștile sunt numărabile: mange kopper.')
        ]
    },
    {
        id: 'little',
        topic: 'Cantitate',
        level: 'A2',
        title: '„Litt” sau „lite”?',
        subtitle: 'Două feluri de a spune „puțin”.',
        modes: [
            mode('compare', 'Compară', 'litt prezintă o cantitate mică existentă; lite pune accent pe cât de mică este cantitatea.', [
                example('Există puțin timp', 'Am puțin timp.', [
                    token('Jeg har'),
                    token('litt', 'puțin', 'focus'),
                    token('tid.')
                ]),
                example('Timpul este puțin', 'Am puțin timp la dispoziție.', [
                    token('Jeg har'),
                    token('lite', 'prea puțin în context', 'focus'),
                    token('tid.')
                ])
            ])
        ],
        questions: [
            question('little-intensifier', 'Vi har veldig ___ tid.', 'Avem foarte puțin timp.', 'lite', [
                'litt',
                'mange'
            ], 'Spunem veldig lite; litt nu se combină cu veldig.'),
            question('little-request', 'Kan jeg få ___ vann?', 'Pot primi un pic de apă?', 'litt', [
                'mange',
                'få'
            ], 'Cerem o cantitate mică de apă: litt vann.'),
            question('little-countable', 'Hun har ___ bøker.', 'Ea are puține cărți.', 'få', [
                'litt',
                'lite'
            ], 'Pentru lucruri numărabile la plural, opusul lui mange este få.')
        ]
    },
    {
        id: 'more',
        topic: 'Cantitate',
        level: 'A2',
        title: 'Cum spui „mai mult”?',
        subtitle: 'Cantitatea și numărul au forme diferite.',
        modes: [
            mode('compare', 'Compară', 'mye → mer pentru cantitate; mange → flere pentru numărul lucrurilor.', [
                example('O cantitate mai mare', 'Vreau mai multă cafea.', [
                    token('Jeg vil ha'),
                    token('mer', 'mai multă', 'focus'),
                    token('kaffe.')
                ], 'coffee'),
                example('Un număr mai mare', 'Vreau mai multe cărți.', [
                    token('Jeg vil ha'),
                    token('flere', 'mai multe', 'focus'),
                    token('bøker.')
                ], 'books')
            ])
        ],
        questions: [
            question('more-coffee', 'Jeg vil ha ___ kaffe.', 'Vreau mai multă cafea.', 'mer', [
                'flere',
                'færre'
            ], 'Pentru o cantitate mai mare folosim mer.'),
            question('more-books', 'Jeg vil ha ___ bøker.', 'Vreau mai multe cărți.', 'flere', [
                'mer',
                'mindre'
            ], 'Pentru un număr mai mare de cărți folosim flere.'),
            question('more-time', 'Vi trenger ___ tid.', 'Avem nevoie de mai mult timp.', 'mer', [
                'flere',
                'færre'
            ], 'Tid exprimă aici o cantitate: mer tid.')
        ]
    },
    {
        id: 'every',
        topic: 'Rutine',
        level: 'A2',
        title: 'În fiecare zi',
        subtitle: 'Alege forma potrivită pentru substantiv.',
        modes: [
            mode('compare', 'Compară', 'hver se folosește cu en/ei; hvert cu et. Substantivul rămâne la singular.', [
                example('en dag', 'Lucrez în fiecare zi.', [
                    token('Jeg jobber'),
                    token('hver', 'fiecare', 'focus'),
                    token('dag.')
                ]),
                example('et år', 'Călătoresc în fiecare an.', [
                    token('Jeg reiser'),
                    token('hvert', 'fiecare', 'focus'),
                    token('år.')
                ])
            ])
        ],
        questions: [
            question('every-day', 'Jeg leser ___ dag.', 'Citesc în fiecare zi.', 'hver', [
                'hvert',
                'alle'
            ], 'Dag se folosește cu en, deci hver dag.'),
            question('every-year', 'Vi reiser ___ år.', 'Călătorim în fiecare an.', 'hvert', [
                'hver',
                'alt'
            ], 'År se folosește cu et, deci hvert år.'),
            question('every-week', 'Hun trener hver ___.', 'Ea se antrenează în fiecare săptămână.', 'uke', [
                'uker',
                'ukene'
            ], 'După hver, substantivul este la singular nehotărât.')
        ]
    },
    {
        id: 'polite-request',
        topic: 'Cereri politicoase',
        level: 'A1',
        title: 'Cere ceva politicos',
        subtitle: 'Alege între a cere și a spune ce dorești.',
        modes: [
            mode('request', 'Cer ceva', 'Kan jeg få …? este un mod obișnuit de a cere ceva.', [
                example('La cafenea', 'Pot primi o cafea?', [
                    token('Kan', 'verb', 'verb'),
                    token('jeg', 'cine', 'person'),
                    token('få', 'primi', 'focus'),
                    token('en kaffe?')
                ], 'coffee')
            ]),
            mode('wish', 'Aș dori', 'Jeg vil gjerne ha … exprimă politicos ce dorești.', [
                example('Spun ce doresc', 'Aș dori o cafea.', [
                    token('Jeg', 'cine', 'person'),
                    token('vil', 'verb', 'verb'),
                    token('gjerne ha', 'aș dori', 'focus'),
                    token('en kaffe.')
                ], 'coffee')
            ])
        ],
        questions: [
            question('polite-get', 'Kan jeg ___ en kaffe?', 'Pot primi o cafea?', 'få', [
                'får',
                'å få'
            ], 'După kan folosim infinitivul fără å: få.'),
            question('polite-have', 'Jeg vil gjerne ___ en kaffe.', 'Aș dori o cafea.', 'ha', [
                'har',
                'å ha'
            ], 'Expresia este vil gjerne ha, cu infinitivul ha.'),
            question('polite-question', '___ få et glass vann?', 'Pot primi un pahar cu apă?', 'Kan jeg', [
                'Jeg kan',
                'Jeg vil'
            ], 'Cererea sub formă de întrebare începe cu Kan jeg …?')
        ]
    }
];
export const norwegianRuleGuides = {
    id: 'nb',
    supportLanguage: 'ro',
    guides: {
        sentences: {
            id: 'sentences',
            title: 'Propoziții',
            rules: sentences
        },
        useful: {
            id: 'useful',
            title: 'Reguli utile',
            rules: useful
        }
    }
};
