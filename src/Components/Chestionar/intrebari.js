export const intrebari = [
    [['meg','oss','deg'],['Jeg trenger litt hjelp - Kan du hjelpe .....?'],['meg']],
    [['oss','dem','deg'],['Anna og Peter trenger litt hjelp - Kan du hjelpe .....'],['dem']],
    [['deg','henne','oss'],['Trenger du litt hjelp? - Jeg kan hjelpe .....'],['deg']]
]

function randomQuestion() {
    const list =   intrebari[Math.floor(Math.random() * intrebari.length)]
    return list;
  }


export {randomQuestion}  
export default intrebari;
