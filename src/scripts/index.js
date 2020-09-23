window.onload = (() => {

    let svg = document.querySelectorAll('.anim-1 path');
    for(let i = 0; i < svg.length; i++){
        console.log(`Letter ${i} length: ${svg[i].getTotalLength()}`);
    }
});