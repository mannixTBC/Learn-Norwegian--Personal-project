// Fresh V2 definitions only. No legacy memory, progress or user profiles.
export const freeConversations = ['A1','A2','B1','B2','C1','C2'].map(level=>({
 schemaVersion:2,id:`free-${level.toLowerCase()}`,familyId:'free',kind:'free',version:1,
 learningLanguage:'nb',level,maxTurns:30,states:['discussion'],initialState:'discussion',criteria:[],transitions:[],
 variants:[{id:'reference',opening:level==='A1'?'Hei! Hva liker du å gjøre?':'Hei! Hva har du lyst til å snakke om i dag?',facts:[]}],
 locales:{ro:{title:'Dialog liber',brief:'Alege un subiect și vorbește cu Nora în ritmul tău.',learnerRole:'Tu',partnerRole:'Nora',hint:'Poți vorbi despre ziua ta sau despre un subiect care te interesează.',criteria:{}}},
}));
