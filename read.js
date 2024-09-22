require(['base/js/namespace', 'base/js/events'], function(Jupyter, events) {
    var cells = Jupyter.notebook.get_cells();
    cells.forEach(function(cell) {
        if (cell.cell_type === 'code') {
            console.log(cell.get_text());
        }
    });
});
