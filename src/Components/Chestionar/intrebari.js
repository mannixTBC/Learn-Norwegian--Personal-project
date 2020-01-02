export const intrebari = [
    [['Roma','Atena','Nicosia'],['1 Care este capitala Imperioului Roman?'],['Roma']],
    [['Roma','Nicropole','Constantinopol'],['2 Care este capitala Imperioului Bizantin?'],['Constantinopol']],
    [['Damasc','Atena','Viena'],['3 Care este capitala Imperioului Sirian?'],['Damasc']]
]

function randomQuestion() {
    const list =   intrebari[Math.floor(Math.random() * intrebari.length)]
    return list;
  }


export {randomQuestion}  
export default intrebari;
