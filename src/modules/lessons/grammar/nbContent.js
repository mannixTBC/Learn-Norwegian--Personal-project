// Adapted from NordLingo Android; content is independent of the renderer.
const cell = (text, tone)=>({
        text,
        tone
    });
const pair = (left, right)=>[
        cell(left),
        cell(right, 'sage')
    ];
function questions(chapter, items) {
    return items.map(([sentence, translation, answer, distractors, explanation], index)=>({
            id: `${chapter}-${index + 1}`,
            sentence,
            translation,
            answer,
            options: [
                answer,
                ...distractors
            ],
            explanation
        }));
}
const nouns = [
    {
        id: 'gender',
        tab: 'Gen',
        title: 'Un cuvânt, un articol',
        subtitle: 'Învață substantivul împreună cu en, ei sau et.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Gen',
                    'Exemplu'
                ],
                rows: [
                    pair('Masculin', 'en bil'),
                    pair('Feminin', 'ei bok'),
                    pair('Neutru', 'et hus')
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Jeg har en bil.',
                        highlights: [
                            'en bil'
                        ],
                        translation: 'Am o mașină.'
                    },
                    {
                        text: 'Vi bor i et hus.',
                        highlights: [
                            'et hus'
                        ],
                        translation: 'Locuim într-o casă.'
                    }
                ]
            }
        ],
        reminder: 'În Bokmål, multe substantive feminine permit și en: ei bok / en bok.',
        questions: questions('nouns-gender', [
            [
                'Jeg har ___ bil.',
                'Am o mașină.',
                'en',
                [
                    'et',
                    'ei'
                ],
                'Bil este masculin: en bil.'
            ],
            [
                'Vi bor i ___ hus.',
                'Locuim într-o casă.',
                'et',
                [
                    'en',
                    'ei'
                ],
                'Hus este neutru: et hus.'
            ],
            [
                'Her er ___ bord.',
                'Aici este o masă.',
                'et',
                [
                    'en',
                    'ei'
                ],
                'Bord este neutru: et bord.'
            ],
            [
                'Jeg trenger ___ stol.',
                'Am nevoie de un scaun.',
                'en',
                [
                    'et',
                    'ei'
                ],
                'Stol este masculin: en stol.'
            ],
            [
                'De har ___ barn.',
                'Ei au un copil.',
                'et',
                [
                    'en',
                    'ei'
                ],
                'Barn este neutru: et barn.'
            ]
        ])
    },
    {
        id: 'definite',
        tab: 'Hotărât',
        title: 'Nehotărât → hotărât',
        subtitle: 'Observă cum se schimbă substantivul.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Nehotărât',
                    'Hotărât'
                ],
                captions: [
                    'un lucru',
                    'lucrul cunoscut'
                ],
                rows: [
                    pair('en bil', 'bilen'),
                    pair('ei bok', 'boka'),
                    pair('et hus', 'huset')
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Jeg har en bil.',
                        highlights: [
                            'en bil'
                        ]
                    },
                    {
                        text: 'Bilen er rød.',
                        highlights: [
                            'Bilen'
                        ],
                        translation: 'Am o mașină. Mașina este roșie.'
                    }
                ]
            }
        ],
        reminder: 'Articolul te ajută să alegi terminația. Poți folosi și en bok → boken.',
        questions: questions('nouns-definite', [
            [
                'Jeg har en bil. ___ er rød.',
                'Am o mașină. Mașina este roșie.',
                'Bilen',
                [
                    'Bil',
                    'Biler'
                ],
                'En bil devine bilen când vorbim despre mașina cunoscută.'
            ],
            [
                'Jeg leser ei bok. Hvor er ___?',
                'Citesc o carte. Unde este cartea?',
                'boka',
                [
                    'bok',
                    'bøker'
                ],
                'Ei bok devine boka. În Bokmål este corectă și forma boken.'
            ],
            [
                'Vi har et hus. ___ er stort.',
                'Avem o casă. Casa este mare.',
                'Huset',
                [
                    'Hus',
                    'Husene'
                ],
                'Et hus devine huset la singular hotărât.'
            ],
            [
                'Her er en stol. ___ er blå.',
                'Aici este un scaun. Scaunul este albastru.',
                'Stolen',
                [
                    'Stol',
                    'Stoler'
                ],
                'En stol devine stolen.'
            ],
            [
                'Jeg kjøper et bord. ___ er nytt.',
                'Cumpăr o masă. Masa este nouă.',
                'Bordet',
                [
                    'Bord',
                    'Bordene'
                ],
                'Et bord devine bordet.'
            ]
        ])
    },
    {
        id: 'plural',
        tab: 'Plural',
        title: 'Unul sau mai multe?',
        subtitle: 'Compară singularul cu pluralul nehotărât.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Unul',
                    'Mai multe'
                ],
                rows: [
                    pair('en bil', 'to biler'),
                    pair('en stol', 'to stoler'),
                    pair('et hus', 'to hus')
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Jeg har en bil.',
                        highlights: [
                            'en bil'
                        ]
                    },
                    {
                        text: 'Vi har to biler.',
                        highlights: [
                            'to biler'
                        ],
                        translation: 'Eu am o mașină. Noi avem două mașini.'
                    }
                ]
            }
        ],
        reminder: 'Multe neutre scurte nu primesc terminație la plural: et hus → to hus.',
        questions: questions('nouns-plural', [
            [
                'Vi har to ___.',
                'Avem două mașini.',
                'biler',
                [
                    'bil',
                    'bilen'
                ],
                'Pluralul nehotărât al lui bil este biler.'
            ],
            [
                'Jeg trenger tre ___.',
                'Am nevoie de trei scaune.',
                'stoler',
                [
                    'stol',
                    'stolen'
                ],
                'En stol → flere stoler.'
            ],
            [
                'Jeg ser to ___.',
                'Văd două case.',
                'hus',
                [
                    'huset',
                    'husene'
                ],
                'Hus nu se schimbă la plural nehotărât.'
            ],
            [
                'Vi kjøper fire ___.',
                'Cumpărăm patru mese.',
                'bord',
                [
                    'bordet',
                    'bordene'
                ],
                'Et bord → fire bord: un neutru scurt fără terminație de plural.'
            ],
            [
                'Det står to ___ her.',
                'Aici stau două autobuze.',
                'busser',
                [
                    'buss',
                    'bussen'
                ],
                'En buss → to busser.'
            ]
        ])
    },
    {
        id: 'exceptions',
        tab: 'Excepții',
        title: 'Pluraluri de reținut',
        subtitle: 'Unele cuvinte își schimbă și rădăcina.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Singular',
                    'Plural'
                ],
                rows: [
                    pair('ei bok', 'bøker'),
                    pair('en mann', 'menn'),
                    pair('et barn', 'barn')
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Jeg leser ei bok.',
                        highlights: [
                            'ei bok'
                        ]
                    },
                    {
                        text: 'Barna leser to bøker.',
                        highlights: [
                            'Barna',
                            'bøker'
                        ],
                        translation: 'Eu citesc o carte. Copiii citesc două cărți.'
                    }
                ]
            }
        ],
        reminder: 'Reține perechea completă: bok–bøker, mann–menn. Barn rămâne barn la plural nehotărât.',
        questions: questions('nouns-exceptions', [
            [
                'Jeg kjøper to ___.',
                'Cumpăr două cărți.',
                'bøker',
                [
                    'boker',
                    'bok'
                ],
                'Ei/en bok are pluralul bøker.'
            ],
            [
                'To ___ venter her.',
                'Doi bărbați așteaptă aici.',
                'menn',
                [
                    'manner',
                    'mann'
                ],
                'En mann → to menn.'
            ],
            [
                'De har tre ___.',
                'Ei au trei copii.',
                'barn',
                [
                    'barner',
                    'barnet'
                ],
                'Et barn → tre barn.'
            ],
            [
                'Jeg har to ___.',
                'Am două picioare (labele picioarelor).',
                'føtter',
                [
                    'foter',
                    'fot'
                ],
                'En fot → to føtter.'
            ],
            [
                'Babyen har to ___.',
                'Bebelușul are doi dinți.',
                'tenner',
                [
                    'tanner',
                    'tann'
                ],
                'Ei/en tann → to tenner.'
            ]
        ])
    }
];
const pronouns = [
    {
        id: 'personal',
        tab: 'Personale',
        title: 'Cine face? Pe cine?',
        subtitle: 'Urmărește rolul pronumelui.',
        blocks: [
            {
                kind: 'roles',
                examples: [
                    {
                        tokens: [
                            {
                                text: 'Jeg',
                                label: 'subiect',
                                tone: 'sage'
                            },
                            {
                                text: 'ser'
                            },
                            {
                                text: 'henne.',
                                label: 'obiect',
                                tone: 'sand'
                            }
                        ],
                        translation: 'Eu o văd.'
                    },
                    {
                        tokens: [
                            {
                                text: 'Hun',
                                label: 'subiect',
                                tone: 'sage'
                            },
                            {
                                text: 'ser'
                            },
                            {
                                text: 'meg.',
                                label: 'obiect',
                                tone: 'sand'
                            }
                        ],
                        translation: 'Ea mă vede.'
                    }
                ]
            },
            {
                kind: 'table',
                compact: true,
                title: 'Forme de reținut',
                rows: [
                    pair('jeg', 'meg'),
                    pair('du', 'deg'),
                    pair('hun', 'henne')
                ]
            }
        ],
        reminder: 'După prepoziții: med meg, til deg. Reține și vi–oss, de–dem.',
        questions: questions('pronouns-personal', [
            [
                'Hun ser ___.',
                'Ea mă vede.',
                'meg',
                [
                    'jeg',
                    'min'
                ],
                'Meg este forma de obiect a lui jeg.'
            ],
            [
                '___ ser henne.',
                'Eu o văd.',
                'Jeg',
                [
                    'Meg',
                    'Min'
                ],
                'Jeg este subiectul: persoana care vede.'
            ],
            [
                'Jeg snakker med ___.',
                'Vorbesc cu tine.',
                'deg',
                [
                    'du',
                    'din'
                ],
                'După med folosim forma de obiect: deg.'
            ],
            [
                'Vi ser ___.',
                'Noi o vedem.',
                'henne',
                [
                    'hun',
                    'hennes'
                ],
                'Henne este forma de obiect; hennes exprimă posesia.'
            ],
            [
                'De hjelper ___.',
                'Ei ne ajută.',
                'oss',
                [
                    'vi',
                    'vår'
                ],
                'Vi → oss când pronumele este obiect.'
            ]
        ])
    },
    {
        id: 'den-det',
        tab: 'Den / det',
        title: 'La ce te referi?',
        subtitle: 'Pronumele păstrează genul substantivului.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Substantiv',
                    'Pronume'
                ],
                rows: [
                    pair('en bil', 'den'),
                    pair('ei bok', 'den'),
                    pair('et hus', 'det')
                ]
            },
            {
                kind: 'sentences',
                title: 'Fără să repeți cuvântul',
                examples: [
                    {
                        text: 'Bilen er ny. Den er rød.',
                        highlights: [
                            'Bilen',
                            'Den'
                        ],
                        translation: 'Mașina este nouă. Este roșie.'
                    },
                    {
                        text: 'Huset er nytt. Det er stort.',
                        highlights: [
                            'Huset',
                            'Det'
                        ],
                        translation: 'Casa este nouă. Este mare.'
                    }
                ]
            }
        ],
        reminder: 'Când înlocuiești un substantiv: en/ei → den, et → det. La plural folosim de ca subiect.',
        questions: questions('pronouns-den-det', [
            [
                'Bilen er ny. ___ er rød.',
                'Mașina este nouă. Este roșie.',
                'Den',
                [
                    'Det',
                    'De'
                ],
                'Bil este masculin, deci pronumele este den.'
            ],
            [
                'Huset er nytt. ___ er stort.',
                'Casa este nouă. Este mare.',
                'Det',
                [
                    'Den',
                    'De'
                ],
                'Hus este neutru: det.'
            ],
            [
                'Boka er her. ___ er interessant.',
                'Cartea este aici. Este interesantă.',
                'Den',
                [
                    'Det',
                    'De'
                ],
                'Pentru bok, feminin sau masculin în Bokmål, folosim den.'
            ],
            [
                'Bordet er nytt. ___ er hvitt.',
                'Masa este nouă. Este albă.',
                'Det',
                [
                    'Den',
                    'De'
                ],
                'Bord este neutru: det.'
            ],
            [
                'Bilene er nye. ___ er røde.',
                'Mașinile sunt noi. Sunt roșii.',
                'De',
                [
                    'Den',
                    'Det'
                ],
                'Bilene este plural. Ca subiect, folosim de.'
            ]
        ])
    },
    {
        id: 'possessive',
        tab: 'Posesive',
        title: 'Al cui este?',
        subtitle: 'Forma lui min urmărește lucrul deținut.',
        blocks: [
            {
                kind: 'table',
                compact: true,
                columns: [
                    'Lucrul deținut',
                    'Al meu / a mea'
                ],
                rows: [
                    pair('bilen', 'bilen min'),
                    pair('boka', 'boka mi'),
                    pair('huset', 'huset mitt'),
                    pair('bøkene', 'bøkene mine')
                ]
            },
            {
                kind: 'sentences',
                title: 'Două poziții corecte',
                examples: [
                    {
                        text: 'Det er bilen min.',
                        highlights: [
                            'bilen min'
                        ]
                    },
                    {
                        text: 'Det er min bil.',
                        highlights: [
                            'min bil'
                        ],
                        translation: 'Ambele înseamnă: este mașina mea.'
                    }
                ]
            }
        ],
        reminder: 'După substantiv: bilen min. Înainte: min bil. Din și vår au și ele forme după gen și număr.',
        questions: questions('pronouns-possessive', [
            [
                'Det er bilen ___.',
                'Este mașina mea.',
                'min',
                [
                    'mitt',
                    'mine'
                ],
                'Bilen este masculin singular: min.'
            ],
            [
                'Det er huset ___.',
                'Este casa mea.',
                'mitt',
                [
                    'min',
                    'mine'
                ],
                'Huset este neutru singular: mitt.'
            ],
            [
                'Her er bøkene ___.',
                'Aici sunt cărțile mele.',
                'mine',
                [
                    'min',
                    'mitt'
                ],
                'Bøkene este plural: mine.'
            ],
            [
                'Dette er ___ hus.',
                'Aceasta este casa mea.',
                'mitt',
                [
                    'min',
                    'mi'
                ],
                'Înainte de un substantiv neutru folosim mitt: mitt hus.'
            ],
            [
                'Jeg kjører ___ bil.',
                'Conduc mașina mea.',
                'min',
                [
                    'mitt',
                    'mine'
                ],
                'Posesiv înaintea substantivului: min bil, cu bil nehotărât.'
            ]
        ])
    },
    {
        id: 'reflexive',
        tab: 'Reflexive',
        title: 'Acțiunea revine la subiect',
        subtitle: 'Subiectul îți arată forma reflexivă.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Subiect',
                    'Reflexiv'
                ],
                rows: [
                    pair('jeg / du', 'meg / deg'),
                    pair('han / hun / de', 'seg'),
                    pair('vi / dere', 'oss / dere')
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Jeg vasker meg.',
                        highlights: [
                            'Jeg',
                            'meg'
                        ],
                        translation: 'Eu mă spăl.'
                    },
                    {
                        text: 'Hun vasker seg.',
                        highlights: [
                            'Hun',
                            'seg'
                        ],
                        translation: 'Ea se spală.'
                    }
                ]
            }
        ],
        reminder: 'Seg se folosește la persoana a treia. Posesia reflexivă: Hun vasker bilen sin — propria mașină.',
        questions: questions('pronouns-reflexive', [
            [
                'Jeg vasker ___.',
                'Eu mă spăl.',
                'meg',
                [
                    'seg',
                    'jeg'
                ],
                'Cu jeg, forma reflexivă este meg.'
            ],
            [
                'Hun vasker ___.',
                'Ea se spală.',
                'seg',
                [
                    'meg',
                    'hun'
                ],
                'Cu hun folosim seg pentru acțiunea asupra propriei persoane.'
            ],
            [
                'Du setter ___ her.',
                'Tu te așezi aici.',
                'deg',
                [
                    'seg',
                    'du'
                ],
                'Du setter deg: forma reflexivă pentru du este deg.'
            ],
            [
                'Vi skynder ___.',
                'Noi ne grăbim.',
                'oss',
                [
                    'seg',
                    'vi'
                ],
                'Vi skynder oss este forma corectă.'
            ],
            [
                'De gleder ___.',
                'Ei se bucură.',
                'seg',
                [
                    'oss',
                    'de'
                ],
                'Cu de, la persoana a treia plural, folosim seg.'
            ]
        ])
    }
];
const adjectives = [
    {
        id: 'agreement',
        tab: 'Acord',
        title: 'Ce substantiv descrii?',
        subtitle: 'Adjectivul se schimbă odată cu el.',
        blocks: [
            {
                kind: 'agreement',
                rows: [
                    {
                        label: 'Masculin',
                        icon: 'car',
                        article: 'en',
                        adjective: 'stor',
                        noun: 'bil'
                    },
                    {
                        label: 'Neutru',
                        icon: 'home',
                        article: 'et',
                        adjective: 'stort',
                        noun: 'hus'
                    },
                    {
                        label: 'Plural',
                        icon: 'cars',
                        article: 'to',
                        adjective: 'store',
                        noun: 'biler'
                    }
                ]
            },
            {
                kind: 'sentences',
                title: 'Și după er',
                examples: [
                    {
                        text: 'Huset er stort.',
                        highlights: [
                            'stort'
                        ]
                    },
                    {
                        text: 'Bilene er store.',
                        highlights: [
                            'store'
                        ]
                    }
                ]
            }
        ],
        reminder: 'Același acord, în două poziții. Multe adjective au -t la neutru și -e la plural.',
        questions: questions('adjectives-agreement', [
            [
                'Vi bor i et ___ hus.',
                'Locuim într-o casă mare.',
                'stort',
                [
                    'stor',
                    'store'
                ],
                'Et hus este neutru: et stort hus.'
            ],
            [
                'Jeg har en ___ bil.',
                'Am o mașină mare.',
                'stor',
                [
                    'stort',
                    'store'
                ],
                'En bil este masculin: en stor bil.'
            ],
            [
                'Vi har to ___ biler.',
                'Avem două mașini mari.',
                'store',
                [
                    'stor',
                    'stort'
                ],
                'La plural folosim store.'
            ],
            [
                'Huset er ___.',
                'Casa este mare.',
                'stort',
                [
                    'stor',
                    'store'
                ],
                'Adjectivul se acordă cu huset și după er: stort.'
            ],
            [
                'Bilene er ___.',
                'Mașinile sunt mari.',
                'store',
                [
                    'stor',
                    'stort'
                ],
                'Bilene este plural, deci store.'
            ]
        ])
    },
    {
        id: 'definite',
        tab: 'Hotărât',
        title: 'Lucrul pe care îl știm',
        subtitle: 'Cu adjectiv, marcăm forma hotărâtă de două ori.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Nehotărât',
                    'Hotărât'
                ],
                rows: [
                    pair('en stor bil', 'den store bilen'),
                    pair('et stort hus', 'det store huset'),
                    pair('store biler', 'de store bilene')
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Jeg liker den store bilen.',
                        highlights: [
                            'den',
                            'store',
                            'bilen'
                        ],
                        translation: 'Îmi place mașina cea mare.'
                    },
                    {
                        text: 'Vi bor i det store huset.',
                        highlights: [
                            'det',
                            'store',
                            'huset'
                        ],
                        translation: 'Locuim în casa cea mare.'
                    }
                ]
            }
        ],
        reminder: 'Den / det / de + adjectiv în -e + substantiv hotărât: det store huset.',
        questions: questions('adjectives-definite', [
            [
                'Jeg liker den ___ bilen.',
                'Îmi place mașina cea mare.',
                'store',
                [
                    'stor',
                    'stort'
                ],
                'După den, în această construcție hotărâtă, folosim store.'
            ],
            [
                'Vi bor i ___ store huset.',
                'Locuim în casa cea mare.',
                'det',
                [
                    'den',
                    'de'
                ],
                'Huset este neutru: det store huset.'
            ],
            [
                'Jeg ser ___ store bilene.',
                'Văd mașinile cele mari.',
                'de',
                [
                    'den',
                    'det'
                ],
                'Bilene este plural: de store bilene.'
            ],
            [
                'Vi liker det ___ huset.',
                'Ne place casa cea mare.',
                'store',
                [
                    'stor',
                    'stort'
                ],
                'Cu det și substantiv hotărât folosim store, nu stort.'
            ],
            [
                'Hun kjører den store ___.',
                'Ea conduce mașina cea mare.',
                'bilen',
                [
                    'bil',
                    'biler'
                ],
                'Substantivul rămâne hotărât: den store bilen.'
            ]
        ])
    },
    {
        id: 'comparison',
        tab: 'Comparație',
        title: 'Mai mult sau cel mai?',
        subtitle: 'Compară forma de bază cu cele două grade.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Bază',
                    'Mai…',
                    'Cel mai…'
                ],
                rows: [
                    [
                        cell('fin'),
                        cell('finere', 'sage'),
                        cell('finest', 'sage')
                    ],
                    [
                        cell('kald'),
                        cell('kaldere', 'sage'),
                        cell('kaldest', 'sage')
                    ],
                    [
                        cell('god'),
                        cell('bedre', 'sage'),
                        cell('best', 'sage')
                    ]
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'I dag er det kaldere enn i går.',
                        highlights: [
                            'kaldere',
                            'enn'
                        ],
                        translation: 'Astăzi este mai frig decât ieri.'
                    },
                    {
                        text: 'Denne boka er best.',
                        highlights: [
                            'best'
                        ],
                        translation: 'Această carte este cea mai bună.'
                    }
                ]
            }
        ],
        reminder: 'Enn înseamnă „decât”. Unele forme sunt neregulate: god → bedre → best.',
        questions: questions('adjectives-comparison', [
            [
                'I dag er det ___ enn i går.',
                'Astăzi este mai frig decât ieri.',
                'kaldere',
                [
                    'kald',
                    'kaldest'
                ],
                'Comparația cu enn cere aici comparativul kaldere.'
            ],
            [
                'Denne boka er ___ enn den andre.',
                'Această carte este mai bună decât cealaltă.',
                'bedre',
                [
                    'god',
                    'best'
                ],
                'Comparativul lui god este bedre.'
            ],
            [
                'Av alle bøkene er denne ___.',
                'Dintre toate cărțile, aceasta este cea mai bună.',
                'best',
                [
                    'god',
                    'bedre'
                ],
                'Pentru „cea mai bună” folosim superlativul best.'
            ],
            [
                'Denne bilen er ___ enn den andre.',
                'Această mașină este mai frumoasă decât cealaltă.',
                'finere',
                [
                    'fin',
                    'finest'
                ],
                'Fin → finere când comparăm cu enn.'
            ],
            [
                'I dette rommet er det ___ i hele huset.',
                'În această cameră este cel mai frig din toată casa.',
                'kaldest',
                [
                    'kald',
                    'kaldere'
                ],
                'Pentru maximul dintr-un grup folosim kaldest.'
            ]
        ])
    },
    {
        id: 'exceptions',
        tab: 'Excepții',
        title: 'Nu adăugăm mereu -t',
        subtitle: 'Reține aceste forme folosite des.',
        blocks: [
            {
                kind: 'table',
                columns: [
                    'Masculin',
                    'Neutru',
                    'Plural'
                ],
                rows: [
                    [
                        cell('liten'),
                        cell('lite', 'sage'),
                        cell('små', 'sage')
                    ],
                    [
                        cell('ny'),
                        cell('nytt', 'sage'),
                        cell('nye', 'sage')
                    ],
                    [
                        cell('billig'),
                        cell('billig', 'sage'),
                        cell('billige', 'sage')
                    ]
                ]
            },
            {
                kind: 'sentences',
                title: 'Într-o propoziție',
                examples: [
                    {
                        text: 'Et lite hus. To små hus.',
                        highlights: [
                            'lite',
                            'små'
                        ],
                        translation: 'O casă mică. Două case mici.'
                    },
                    {
                        text: 'Et nytt og billig bord.',
                        highlights: [
                            'nytt',
                            'billig'
                        ],
                        translation: 'O masă nouă și ieftină.'
                    }
                ]
            }
        ],
        reminder: 'Liten are și lita la feminin, lille la singular hotărât. Adjectivele în -ig nu primesc -t.',
        questions: questions('adjectives-exceptions', [
            [
                'Vi har et ___ hus.',
                'Avem o casă mică.',
                'lite',
                [
                    'liten',
                    'små'
                ],
                'La neutru: et lite hus.'
            ],
            [
                'Jeg ser to ___ biler.',
                'Văd două mașini mici.',
                'små',
                [
                    'liten',
                    'lite'
                ],
                'Pluralul lui liten este små.'
            ],
            [
                'Dette er et ___ bord.',
                'Aceasta este o masă nouă.',
                'nytt',
                [
                    'ny',
                    'nye'
                ],
                'Ny primește -tt la neutru: nytt.'
            ],
            [
                'Jeg kjøper et ___ bord.',
                'Cumpăr o masă ieftină.',
                'billig',
                [
                    'billigt',
                    'billige'
                ],
                'Billig se termină în -ig și nu primește -t la neutru.'
            ],
            [
                'Vi liker den ___ bilen.',
                'Ne place mașina cea mică.',
                'lille',
                [
                    'liten',
                    'lite'
                ],
                'La singular hotărât folosim lille: den lille bilen.'
            ]
        ])
    }
];
export const norwegianGrammar = {
    id: 'nb',
    categories: {
        nouns: {
            id: 'nouns',
            title: 'Substantive',
            initialChapter: 'definite',
            chapters: nouns
        },
        pronouns: {
            id: 'pronouns',
            title: 'Pronume',
            initialChapter: 'personal',
            chapters: pronouns
        },
        adjectives: {
            id: 'adjectives',
            title: 'Adjective',
            initialChapter: 'agreement',
            chapters: adjectives
        }
    }
};
