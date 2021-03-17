const print = console.log

const maxPos = (arr) => {
    m = 0
    for(let i=1; i<arr.length; i++){
        if(arr[m] < arr[i]) m = i;
    }
    return m
}

function makeArray(r,c,val=0){
    return [...Array(r).keys()].map(x=>[...Array(c).keys()].map(x=>val))
}

const sigmoid = (S) => {
    return 1 / (1 + Math.exp(-S))
}

const sigmoidD = (y) => {
    return y * (1 - y)
}

class Matrix{
    constructor(arr){
        this.rows = arr.length
        this.cols = this.rows==0 ? 0 : arr[0].length

        this.elements = arr

        // console.log(this.elements)
    }

    add = (m) => {
        if(m.cols != this.cols && m.rows != this.rows) return undefined

        for(let i=0;i<this.rows;i++)
            for(let j=0;j<this.cols;j++)
                this.elements[i][j] += m.elements[i][j]
    }

    addA = (m) => {
        if(m.length != this.rows && m.cols != this.cols) return undefined

        for(let i=0;i<this.rows;i++)
            for(let j=0;j<this.cols;j++)
                this.elements[i][j] += m[i][j]
    }

    multiply = (m) => {
        if(m.rows != this.cols) return undefined

        // print(m.elements,this.elements)

        let res = []
        for(let i=0;i<this.rows;i++){
            // console.log('i=',i)
            let temp = []
            for(let j=0;j<m.cols;j++){
                // console.log('j=',j)
                let s = 0
                for(let k=0;k<m.rows;k++){
                    // console.log('k=',k)
                    s += this.elements[i][k] * m.elements[k][j]
                }
                // console.log('s=',s)
                temp.push(s)
            }
            // console.log(res)
            res.push(temp)
        }

        return new Matrix(res)
    }

    randomize = (low=0,high=1) => {
        this.elements = this.elements.map(x => x.map(y => (Math.random() * (high-low) + low)))
    }

    activate = (func=sigmoid) => {
        this.elements = this.elements.map(x => x.map(y => func(y)))
    }
    
}

class NeuralNetwork{
    constructor(i,h,o){
        this.num_input = i
        this.num_hidden = h
        this.num_output = o

        this.lr = 0.1

        this.IH_weights = new Matrix(makeArray(this.num_input, this.num_hidden))
        this.IH_weights.randomize(-0.5,0.5)
        this.OH_weights = new Matrix(makeArray(this.num_hidden, this.num_output))
        this.OH_weights.randomize(-0.5,0.5)

        this.IH_bias = new Matrix(makeArray(1, this.num_hidden))
        this.IH_bias.randomize(-0.5,0.5)
        this.OH_bias = new Matrix(makeArray(1, this.num_output))
        this.OH_bias.randomize(-0.5,0.5)

        this.hidden_outputs = null
        this.outputs = null
    }

    forward = (inputs, outs) => {
        // print('FORWARD')
        if(inputs.length != this.num_input){
            inputs = [...Array(this.num_input).keys()].map(i => {
                if(i<inputs.length) return inputs[i]
                return 0
            })
        }
        // print('inputs:',inputs)
        this.hidden_outputs = new Matrix([inputs]).multiply(this.IH_weights)
        this.hidden_outputs.add(this.IH_bias)
        this.hidden_outputs.activate()
        // console.log(hidden_outputs)

        this.outputs = this.hidden_outputs.multiply(this.OH_weights)
        this.outputs.add(this.OH_bias)
        this.outputs.activate()

        // let J = 0
        // for(let i=0; i<this.num_input; i++){
        //     J += Math.pow((outs[i] - this.outputs.elements[0][i]), 2)
        // }

        // return J / this.num_input
        
        // print(this.outputs.elements[0])
    }

    back_propagate = (inputs, outs) => {
        // print('BACKWARD')
        let delta_i = []
        let delta_j = []

        for(let i=0; i<this.num_output; i++){
            delta_i.push((outs[i] - this.outputs.elements[0][i]) * sigmoidD(this.outputs.elements[0][i]))
            // print(delta_i[i])
            for(let j=0; j<this.num_hidden; j++){
                this.OH_weights.elements[j][i] += this.lr * delta_i[i] * this.hidden_outputs.elements[0][j]
            }
            this.OH_bias.elements[0][i] += this.lr * delta_i[i]
        }
        
        for(let j=0; j<this.num_hidden; j++){
            let sum_delta = 0
            for(let i=0;i<this.num_output;i++)
                sum_delta += delta_i[i] * this.OH_weights.elements[j][i]
            
            delta_j.push((sum_delta) * sigmoidD(this.hidden_outputs.elements[0][j]))
            for(let k=0; k<this.num_input; k++){
                this.IH_weights.elements[k][j] += this.lr * delta_j[j] * inputs[k]
            }
            this.IH_bias.elements[0][j] += this.lr * delta_j[j]
        }
        
        // print(this.OH_weights.elements)

    }

    train = (X_train, Y_train,verbose=true, epochs=1, shuffle=true) => {
        for(let i=0;i<epochs;i++){
            if(shuffle){
                let indices = randomSample([...Array(X_train.length).keys()], X_train.length)
                X_train = reorder(X_train, indices)
                Y_train = reorder(Y_train, indices)
            }
            if(verbose) print('Epoch '+String(i+1))
            for(let j=0;j<X_train.length;j++){
                this.forward(X_train[j])
                this.back_propagate(X_train[j],Y_train[j])
            }
        }
        print('Done')
    }

    predict = (inputs) => {
        let preds = inputs.map(x => {
            this.forward(x)
            return maxPos(this.outputs.elements[0])
        })
        // console.log(preds)
        return preds
    }

    predictOne = (input) => {
        return this.predict([input])[0]
    }


    save(filename, weights_only=true){
        if(!weights_only) return

        let data = {
            'OH':this.OH_weights.elements,
            'OB':this.OH_bias.elements,
            'IH':this.IH_weights.elements,
            'HB':this.IH_bias.elements,
        }

        let text = JSON.stringify(data)
        downloadToFile(text, filename)
        print('saved')

    }

    load_weights(data_text){
        let data = JSON.parse(data_text)

        this.OH_weights = new Matrix(data['OH'])
        this.OH_bias = new Matrix(data['OB'])
        this.IH_weights = new Matrix(data['IH'])
        this.IH_bias = new Matrix(data['HB'])

        print('loaded')
    }
    
}

document.getElementById('file-selector') 
    .addEventListener('change', function() { 
        
    var fr=new FileReader(); 
    fr.readAsText(this.files[0]);
    fr.onload=function(e){
        Brain.load_weights(fr.result)
    } 
}) 

document.getElementById('btn-save-model').addEventListener('click',()=>{
    Brain.save()
})


function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                return allText;
            }
        }
    }
    rawFile.send(null);
}

function randomSample(arr,num){
    let my_set = new Set(arr)
    // print(my_set)
    res = []
    for(let i=0;i<num && i<arr.length; i++){
        val = [...my_set.values()][Math.floor(Math.random()*(arr.length-i))]
        res.push(val)
        my_set.delete(val)
    }
    return res
}

function reorder(arr,inds){
    res = []
    for(i=0;i<inds.length && i<arr.length; i++){
        res.push(arr[inds[i]])
    }
    return res
}

// N = new NeuralNetwork(2,1000,1)
// X_train = [[0,0],[0,1],[1,0],[1,1]]
// N.train(X_train, [[0],[1],[1],[0]], 1000)

// print(N.predict(X_train))

NUM_CLASSES = 7
chordNames = ['Cmaj','Dm','Em','Emaj','Fmaj','Gmaj','Am']
Brain = new NeuralNetwork(60,1000,6)

training_data = []
for(let i=0;i<NUM_CLASSES;i++) training_data.push([])
training_labels = []

function to_categorical(x,n){
    res = []
    for(i=0;i<n;i++)
        if(i==x) res.push(1)
        else res.push(0)
    return res
}

function addToTrainingData(arr, label){
    // format: [] len 60
    arr = arr.map(x => {
        if(x<-100) return -100
        return x
    })
    // let condensed = [0,0,0,0,0,0,0,0,0,0,0,0]
    // for(let i=0;i<arr.length;i++){
    //     condensed[i%12] += arr[i]
    // }
    if(Math.max(...arr) < -80) return
    print('adding...')
    condensed = arr.map(x => (100+(x)) / 100)
    training_data[label].push(condensed)
}

function predictChord(arr){
    arr = arr.map(x => {
        if(x<-100) return -100
        return x
    })
    // let condensed = [0,0,0,0,0,0,0,0,0,0,0,0]
    // for(let i=0;i<arr.length;i++){
    //     condensed[i%12] += arr[i]
    // }
    condensed = arr.map(x => (100+(x)) / 100)
    document.getElementById('detectedChord').innerHTML = chordNames[Brain.predictOne(condensed)]
}


function normalizePredict(arr){
    arr = arr.map(x=>{
        if(x == -Infinity) return -100
        return x
    })
    arr = arr.map(x => (x + 100)/100)

    pred = Brain.predict([arr])
    print('prediction: ',pred)
    return pred

}

const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    
    a.href= URL.createObjectURL(file);
    a.download = filename;
    a.click();
  
      URL.revokeObjectURL(a.href);
};

function saveTrainingData(epochs=100){
    // downloadToFile(JSON.stringify(training_data), 'x_train.txt')
    // downloadToFile(JSON.stringify(training_labels), 'y_train.txt')
    // document.getElementById('neural').innerHTML = ''
    // for(i=0;i<training_data.length;i++){ document.getElementById('neural').innerHTML += '['+training_data[i]+']'; document.getElementById('neural').innerHTML += '<br>'}

    X_train = []
    Y_train = []
    minLen = Math.min(...training_data.map(x=>x.length))
    for(let i=0;i<minLen; i++){
        for(let j=0;j<training_data.length;j++){
            X_train.push(training_data[j][i])
            Y_train.push(to_categorical(j,training_data.length))
        }
    }

    Brain.train(X_train,Y_train,epochs)
}

