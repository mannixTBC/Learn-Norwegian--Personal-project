var programming_languages = [
	["python","cum se numete python"],
	["beklager","Cum spui imi pare rau?"],
	["bil","cum se traduce in norvegiana cuvantul masina?"],
	["mor","cum se traduce in norvegiana cuvantul mama?"],
	["flyplassen","cum se traduce pe norvegiana aeroport?"],
	["hus","cum se traduce pe norvegiana cuvantul casa?"],
	
]

function randomList() {
  const list =   programming_languages[Math.floor(Math.random() * programming_languages.length)]
  return list;
}

export { randomList }