import { selectScenarioRecommendations } from './scenarioRecommendations.mjs';
const presentations = {
    'general-introduction': {
        summary: 'Ești Alex, noul vecin. Prezintă-te Norei și cere să vezi intrarea comună.',
        topics: 'Saluturi · Prezentare · Orientare',
        goals: [
            'Prezintă-te ca Alex, noul vecin.',
            'Cere să vezi intrarea comună.',
            'Confirmă care este intrarea comună.'
        ]
    },
    'cafe-order': {
        title: 'Comandă o cafea',
        topics: 'Comandă · Preferințe · Confirmare'
    },
    'general-toilet': {
        topics: 'Locuri · Întrebări · Direcții',
        goals: [
            'Spune ce loc cauți.',
            'Cere indicații către toaletă.',
            'Confirmă direcția indicată.'
        ]
    },
    'general-library-card': {
        title: 'Prima vizită la bibliotecă',
        topics: 'Prezentare · Cereri · Clarificare'
    },
    'general-phone-number': {
        title: 'Un număr de contact',
        topics: 'Numere · Date de contact · Confirmare'
    },
    'general-parcel': {
        topics: 'Colet · Identificare · Confirmare'
    },
    'general-neighbor-noise': {
        topics: 'Vecini · Cereri politicoase · Acord'
    },
    'general-hair-appointment': {
        topics: 'Programări · Ore · Disponibilitate'
    },
    'general-gym-visit': {
        topics: 'Program · Întrebări · Vizită'
    },
    'general-coffee-invite': {
        topics: 'Invitații · Ore · Preferințe'
    },
    'general-laundry-time': {
        topics: 'Rezervări · Ore · Confirmare'
    },
    'general-weather-plan': {
        topics: 'Vreme · Planuri · Alternative'
    },
    'general-wrong-parcel': {
        topics: 'Coduri · Verificare · Clarificare'
    },
    'general-home-repair': {
        topics: 'Locuință · Descriere · Ajutor'
    },
    'general-wrong-drink': {
        topics: 'Comandă · Problemă · Soluție'
    },
    'general-missed-visit': {
        topics: 'Explicații · Programare · Confirmare'
    },
    'general-subscription': {
        topics: 'Plăți · Clarificare · Verificare'
    },
    'general-building-work': {
        topics: 'Anunțuri · Date · Clarificare'
    },
    'general-event-change': {
        topics: 'Locuri · Schimbări · Confirmare'
    },
    'general-service-followup': {
        topics: 'Solicitări · Stadiu · Următorul pas'
    },
    'transport-introduction': {
        title: 'Un coleg nou',
        summary: 'Ești Alex, șofer nou pe linia 12. Prezintă-te colegei tale, Nora, și stabiliți unde vă întâlniți.',
        topics: 'Saluturi · Nume · Locul întâlnirii',
        goals: [
            'Prezintă-te ca Alex, șofer pe linia 12.',
            'Întreabă unde vă întâlniți.',
            'Confirmă locul întâlnirii.'
        ]
    },
    'bus-delay': {
        title: 'Anunță o întârziere',
        topics: 'Durată · Motiv · Următorul pas'
    },
    'bus-ticket': {
        topics: 'Bilet · Aplicație · Verificare',
        goals: [
            'Clarifică problema biletului din aplicație.',
            'Cere redeschiderea aplicației.',
            'Confirmă ce veți verifica mai departe.'
        ]
    },
    'bus-lost-bag': {
        title: 'Un rucsac uitat',
        topics: 'Obiecte · Descriere · Predare',
        goals: [
            'Spune că ai găsit un rucsac albastru.',
            'Cere înregistrarea obiectului găsit.',
            'Confirmă unde îl predai.'
        ]
    },
    'bus-stop-question': {
        topics: 'Stații · Orientare · Ajutor',
        goals: [
            'Spune că Biblioteket este următoarea stație.',
            'Oferă să anunți stația.',
            'Confirmă unde vrea pasagera să coboare.'
        ]
    },
    'transport-driver-card': {
        topics: 'Nume · Listă · Verificare',
        goals: [
            'Spune că numele tău lipsește de pe listă.',
            'Cere verificarea listei pentru linia 12.',
            'Confirmă lista și următorul pas.'
        ]
    },
    'transport-break-room': {
        topics: 'Locuri · Întrebări · Direcții'
    },
    'transport-radio-check': {
        topics: 'Mesaje · Repetare · Clarificare'
    },
    'transport-shift-time': {
        topics: 'Ore · Program · Confirmare'
    },
    'transport-break-change': {
        topics: 'Program · Cereri · Verificare'
    },
    'transport-delivery-window': {
        topics: 'Livrare · Ore · Alegere'
    },
    'transport-vehicle-handover': {
        title: 'Predarea autobuzului',
        topics: 'Întâlnire · Loc · Confirmare'
    },
    'transport-wrong-address': {
        topics: 'Adrese · Diferențe · Clarificare'
    },
    'transport-damaged-box': {
        topics: 'Ambalaj · Descriere · Raportare'
    },
    'transport-missing-label': {
        topics: 'Etichetă · Identificare · Ajutor'
    },
    'transport-passenger-transfer': {
        topics: 'Conexiuni · Informații · Verificare'
    },
    'transport-diversion-message': {
        topics: 'Traseu · Anunțuri · Clarificare'
    },
    'transport-load-priority': {
        topics: 'Livrări · Priorități · Acord'
    },
    'transport-disputed-delivery': {
        topics: 'Livrare · Neclarități · Verificare'
    },
    'transport-shift-summary': {
        title: 'Predarea unei situații',
        topics: 'Rezumat · Stadiu · Responsabilități'
    }
};
const introductions = {
    general: 'general-introduction',
    transport: 'transport-introduction',
    hospitality: 'hotel-first-shift',
    office: 'office-introduction',
    construction: 'site-new-colleague',
    healthcare: 'care-new-colleague',
    cleaning: 'cleaning-new-team',
    retail: 'shop-new-colleague',
    studies: 'study-introduction',
    family: 'family-new-neighbor'
};
const firstAlternatives = {
    general: [
        'cafe-order',
        'general-toilet'
    ],
    transport: [
        'bus-delay',
        'bus-ticket'
    ]
};
export function scenarioPresentation(scenario) {
    const copy = presentations[scenario.id];
    const summary = copy?.summary || scenario.brief.split(/(?<=[.!?])\s+/).filter((sentence)=>!/^Nora\b/.test(sentence)).slice(0, 3).join(' ');
    return {
        title: copy?.title || scenario.title,
        summary,
        topics: copy?.topics || scenario.difficulty.label || 'Conversație · Clarificare · Confirmare',
        minutes: Math.max(3, Math.round(scenario.difficulty.turns * .45) + ((scenario.stage || 1) >= 3 ? 1 : 0)),
        goals: scenario.goals.map((goal, i)=>{
            const generic = [
                'describe-situation',
                'request-action',
                'confirm-plan'
            ][i];
            return generic && scenario.objectiveIds?.[i] === generic && copy?.goals?.[i] ? copy.goals[i] : goal;
        })
    };
}
export function recommendedScenario({ scenarios, stage, progress, completed, links, seed }) {
    const intro = introductions[scenarios[0]?.path];
    if (!completed.length && !Object.values(progress).some((value)=>value?.latest)) {
        const first = scenarios.find((s)=>s.id === intro);
        if (first) return first;
    }
    return selectScenarioRecommendations({
        scenarios,
        stage,
        progress,
        completed,
        links,
        seed
    })[0]?.scenario || scenarios[0];
}
export function scenarioAlternatives(scenarios, selectedId, round = 0) {
    const preferred = firstAlternatives[scenarios[0]?.path] || [];
    const rank = (s)=>{
        const index = preferred.indexOf(s.id);
        return index < 0 ? preferred.length + (s.stage || 1) : index;
    };
    const others = scenarios.filter((s)=>s.id !== selectedId).sort((a, b)=>rank(a) - rank(b));
    if (!others.length) return [];
    const offset = Math.max(0, Math.floor(round)) * 2 % others.length;
    return Array.from({
        length: Math.min(2, others.length)
    }, (_, i)=>others[(offset + i) % others.length]);
}
export function scenarioBadge(id, recommendedId, progress) {
    const result = progress[id]?.latest;
    if (result?.endReason === 'turn_limit') return 'De reluat';
    if (result?.endReason === 'success') return 'Obiective îndeplinite';
    return id === recommendedId ? 'Recomandat pentru tine' : 'La alegerea ta';
}
