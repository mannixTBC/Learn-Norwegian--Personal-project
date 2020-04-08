var programming_languages = [
	
	["beklager","Cum traduci imi pare rau?"],
	["bil","Cum se traduce in norvegiana cuvantul masina?"],
	["mor","Cum se traduce in norvegiana cuvantul mama?"],
	["flyplassen","Cum se traduce pe norvegiana aeroport?"],
	["hus","Cum se traduce pe norvegiana cuvantul casa?"],
	
]

function randomList() {
  const list =   programming_languages[Math.floor(Math.random() * programming_languages.length)]
  return list;
}

export { randomList }