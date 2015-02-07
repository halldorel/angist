


function populateColorPicker()
{
	var pallet = document.getElementById('colorPicker');

    for (var color in colors)
    {
        var div = document.createElement("div");
        div.style.width = '25px';
        div.style.height = '25px';
        div.style.background = colors[color];
        div.id = color;

       	div.addEventListener('click',function(){
       		makeNewPath(this.id);
       	},false);
        pallet.appendChild(div);
    }
}

populateColorPicker();