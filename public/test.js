


function populateColorPicker()
{
	var pallet = document.getElementById('colorPicker');

    for (var color in colors)
    {
        var div = document.createElement("div");
        div.style.width = '25px';
        div.style.height = '25px';
        div.style.background = colors[color];
        div.className = color
        div.id = color;

       	div.addEventListener('click',function(){
<<<<<<< HEAD
          socket.emit(events.colorChange, this.className);
       	  setSelectedColor(this.className);

=======
       	    setSelectedColor(this.id);
>>>>>>> 5d68f5a57a5341151a306a4b0fac00424b13c750
       	},false);
        pallet.appendChild(div);
    }
}

populateColorPicker();