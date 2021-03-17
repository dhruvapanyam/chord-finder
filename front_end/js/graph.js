//-----------------------------------------------------------------------------------------CANVAS-------------------------------------------------------------------------------------------------------------


var threshold = [-60,-55,-50,-45,-40]
var octaveRegions = 
[
    {start:20,end:60},
    {start:47,end:94},
    {start:94,end:188},
    {start:188,end:378},
    {start:378,end:740},
]

for(t in threshold){
    // document.getElementById('threshold'+String(t)).innerHTML = threshold[t]
    // document.getElementById('limit'+String(t)).value = threshold[t]
}

for(i in octaveRegions){
    o = parseInt(i)
    // console.log(document.getElementById('stripStart'+String(o)))
    // document.getElementById('stripStart'+String(o)).innerHTML = octaveRegions[o].start
    // document.getElementById('stripEnd'+String(o)).innerHTML = octaveRegions[o].end

    s = document.getElementById('start'+String(o))
    // console.log(s)
    s.value = octaveRegions[o].start
    if(o==0)
        s.min = octaveRegions[0].start
    else
        s.min = Math.floor((octaveRegions[o-1].end + octaveRegions[o-1].start)/2)
    
    if(o==4)
        s.max = octaveRegions[4].end
    else
        s.max = octaveRegions[o+1].start
    
    e = document.getElementById('end'+String(o))
    e.value = octaveRegions[o].end
    if(o==0)
        e.min = octaveRegions[0].start
    else
        e.min = octaveRegions[o-1].end
    
    if(o==4)
        e.max = octaveRegions[4].end
    else
        e.max = Math.floor((octaveRegions[o+1].end + octaveRegions[o+1].start)/2)
    
}

var graphPoints = []

for(var i=0;i<octaveRegions[4].end;i++){
    // console.log(i,i in notes)
    graphPoints.push({x:i,y:-95})
}
// graphPoints.push({x:160,y:-95})

// console.log(graphPoints)

var chart = new CanvasJS.Chart("chartContainer",{
    title :{
        text: "Audio FFT"
    },
    // backgroundColor: '#94a8b0',
    theme: 'dark1',
    axisX: {						
        title: "Frequency",
        stripLines:[                    // FOR EACH OCTAVE
        {
            startValue: octaveRegions[0].start,             // OCTAVE 1
            endValue: octaveRegions[0].end,
            color:"#8cbec2",
            opacity:0.1
        },
        {
            startValue: octaveRegions[1].start,             // OCTAVE 2
            endValue: octaveRegions[1].end,
            color:"#ffd480",
            opacity:0.1
        },
        {
            startValue: octaveRegions[2].start,             // OCTAVE 3
            endValue: octaveRegions[2].end,
            color:"#f08d86",
            opacity:0.1
        },
        {
            startValue: octaveRegions[3].start,             // OCTAVE 4
            endValue: octaveRegions[3].end,
            color:"#a1de90",
            opacity:0.1
        },
        {
            startValue: octaveRegions[4].start,             // OCTAVE 5
            endValue: octaveRegions[4].end,
            color:"#b5b5ba",
            opacity:0.1
        }
        ]
    },
    axisY: {						
        title: "Strength",
        stripLines:[
            {
                value: threshold[0],
                color:"red",
                thickness:2,
                opacity: 0.7

            },
            {
                value: threshold[1],
                color:"red",
                thickness:2,
                opacity: 0.7

            },
            {
                value: threshold[2],
                color:"red",
                thickness:2,
                opacity: 0.7

            },
            {
                value: threshold[3],
                color:"red",
                thickness:2,
                opacity: 0.7

            },
            {
                value: threshold[4],
                color:"red",
                thickness:2,
                opacity: 0.7

            }
        ]
    },
    data: [{
        type: "line",
        dataPoints : graphPoints
    }]
});

chart.render();
var DISPLAY_GRAPH = true


function toggleGraphDisplay(val){
    DISPLAY_GRAPH = val
}

var updateInterval = 1;

//-----------------------------------------------------------------------------METHODS------------------------------------------------------------------------------

function changeThreshold(octave,val){
    // console.log('threshold is',B_THRESHOLD)
    threshold[octave] = parseInt(val)
    
    document.getElementById('threshold'+String(octave)).innerHTML = threshold[octave]

    // chart.axisY[0].stripLines[octave].set('value',Math.floor(threshold[octave]))
}

function changeStripRegion(octave,endPoint,val){
    if(endPoint==0) // start
    {
        octaveRegions[octave].start = parseInt(val)
        document.getElementById('stripStart'+String(octave)).innerHTML = octaveRegions[octave].start
    
        chart.axisX[0].stripLines[octave].set('startValue',(octaveRegions[octave].start))

        if(octave==0)
            p = 0
        else
            p = octaveRegions[octave-1].end
        for(;p<parseInt(val);p++)
            graphPoints[p]['y']=-95;
    }

    else
    {
        octaveRegions[octave].end = parseInt(val)
        document.getElementById('stripEnd'+String(octave)).innerHTML = octaveRegions[octave].end
    
        chart.axisX[0].stripLines[octave].set('endValue',(octaveRegions[octave].end))

        if(octave==4)
            p = octaveRegions[4].end
        else
            p = octaveRegions[octave+1].start
        for(;p>parseInt(val);p--)
            graphPoints[p]['y']=-95;
    }
}

// ---------------------------------------------------------------------------------------------------------------