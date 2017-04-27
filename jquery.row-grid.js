(function($){
  $.fn.rowGrid = function( options ) {
    return this.each(function() {
      $this = $(this);
      if(options === 'appended') {
        options = $this.data('grid-options');
        var $lastRow = $this.children('.' + options.lastRowClass);
        var items = $lastRow.nextAll(options.itemSelector).add($lastRow);
        layout(this, options, items);
      } else {
        options = $.extend( {}, $.fn.rowGrid.defaults, options );
        $this.data('grid-options', options);
        layout(this, options);

        if (options.resize) {
          $(window).on('resize.rowGrid', {container: this}, function(event) {
            layout(event.data.container, options);
          });
        }
      }
    });
  };

  $.fn.rowGrid.defaults = {
    minMargin: null,
    maxMargin: null,
    resize: true,
    lastRowClass: 'last-row',
    firstItemClass: null
  };

  function layout(container, options, _items) {
    var rowWidth = 0,
        rowElems = [],
        items = jQuery.makeArray(_items || container.querySelectorAll(options.itemSelector)),
        itemsSize = items.length;

    // read
    var containerBoundingRect = container.getBoundingClientRect();
    var containerWidth = Math.floor(containerBoundingRect.right - containerBoundingRect.left) - parseFloat($(container).css('padding-left')) - parseFloat($(container).css('padding-right'));
    var itemAttrs = [];
    var theImage, w, h;

    for (var i = 0; i < itemsSize; ++i) {
      theImage = items[i].getElementsByTagName('img')[0];
      if (!theImage) {
        items.splice(i, 1);
        --i;
        --itemsSize;
        continue;
      }

      // get width and height via attribute or js value
      if (!(w = parseInt(theImage.getAttribute('width')))) {
        theImage.setAttribute('width', w = theImage.offsetWidth);
      }
      if (!(h = parseInt(theImage.getAttribute('height')))) {
        theImage.setAttribute('height', h = theImage.offsetHeight);
      }

      itemAttrs[i] = {
        width: w,
        height: h
      };
    }
    itemsSize = items.length;

    // write
    for (var index = 0; index < itemsSize; ++index) {
      var rowElemIndex;

      if (items[index].classList) {
        items[index].classList.remove(options.firstItemClass);
        items[index].classList.remove(options.lastRowClass);
      } else {
        // IE <10
        items[index].className = items[index].className.replace(new RegExp('(^|\\b)' + options.firstItemClass + '|' + options.lastRowClass + '(\\b|$)', 'gi'), ' ');
      }

      rowWidth += itemAttrs[index].width;
      rowElems.push(items[index]);

      // check if it is the last element
      if (index === itemsSize - 1) {
        for(rowElemIndex = 0; rowElemIndex<rowElems.length; rowElemIndex++) {
          // if first element in row
          if(rowElemIndex === 0) {
            rowElems[rowElemIndex].className += ' ' + options.lastRowClass;
          }
          rowElems[rowElemIndex].style.width = itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].width + 'px';
          rowElems[rowElemIndex].style.height = itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].height + 'px';
          rowElems[rowElemIndex].style.marginRight = ((rowElemIndex < rowElems.length - 1)?options.minMargin+'px' : 0);
        }
      }

      // check whether width of row is too high
      if (rowWidth + options.maxMargin * (rowElems.length - 1) > containerWidth) {
        var diff = rowWidth + options.maxMargin * (rowElems.length - 1) - containerWidth,
            nrOfElems = rowElems.length,
            maxSave = (options.maxMargin - options.minMargin) * (nrOfElems - 1),
            rowMargin;

        // change margin
        if (maxSave < diff) {
          rowMargin = options.minMargin;
          diff -= (options.maxMargin - options.minMargin) * (nrOfElems - 1);
        } else {
          rowMargin = options.maxMargin - diff / (nrOfElems - 1);
          diff = 0;
        }

        var rowElem,
            widthDiff = 0;

        for (rowElemIndex = 0; rowElemIndex<rowElems.length; rowElemIndex++) {
          rowElem = rowElems[rowElemIndex];
          var rowElemWidth = itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].width;
          var newWidth = rowElemWidth - (rowElemWidth / rowWidth) * diff;
          var newHeight = Math.round(itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].height * (newWidth / rowElemWidth));

          if (widthDiff + 1 - newWidth % 1 >= 0.5 ) {
            widthDiff -= newWidth % 1;
            newWidth = Math.floor(newWidth);
          } else {
            widthDiff += 1 - newWidth % 1;
            newWidth = Math.ceil(newWidth);
          }

          rowElem.style.width = newWidth + 'px';
          rowElem.style.height = newHeight + 'px';
          rowElem.style.marginRight = ((rowElemIndex < rowElems.length - 1)?rowMargin : 0) + 'px';

          if (rowElemIndex === 0) {
            rowElem.className += ' ' + options.firstItemClass;
          }
        }

        rowElems = [],
        rowWidth = 0;
      }
    }
  }
})(jQuery);