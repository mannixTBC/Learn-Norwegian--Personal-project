
const initialData = {
tasks :{
    "task 1" : {id :'task 1', content : "bever", description:'animal'},
    "task 2" : {id :'task 2', content : "kalv", description:'animal'},
    "task 3" : {id :'task 3', content : "svart", description:'color'},
    "task 4" : {id :'task 4', content : "gul", description: 'color'},
},
columns : {
    "column-1":{
        id:'column-1',
        title: "to be ordered",
        taskIds: ["task 1","task 2","task 3","task 4"],
        description : 'animal'
    },
    "column-2":{
        id:'column-2',
        title: "Animals",
        taskIds: [],
        description:'animal'
    },
    "column-3":{
        id:'column-3',
        title: "Colors",
        taskIds: [],
        description:'color'
    }
},
columnOrder: ['column-1','column-2','column-3'],
correctAnswers:0

}

export default initialData;