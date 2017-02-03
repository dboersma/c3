c3_chart_internal_fn.initLegend = function () {
    var $$ = this;
    $$.legendItemTextBox = {};
    $$.legendHasRendered = false;
    $$.legend = $$.svg.append("g").attr("transform", $$.getTranslate('legend'));
    if (!$$.config.legend_show) {
        $$.legend.style('visibility', 'hidden');
        $$.hiddenLegendIds = $$.mapToIds($$.data.targets);
        return;
    }
    // MEMO: call here to update legend box and tranlate for all
    // MEMO: translate will be upated by this, so transform not needed in updateLegend()
    $$.updateLegendWithDefaults();
};
c3_chart_internal_fn.updateLegendWithDefaults = function () {
    var $$ = this;
    $$.updateLegend($$.mapToIds($$.data.targets), {withTransform: false, withTransitionForTransform: false, withTransition: false});
};
c3_chart_internal_fn.updateSizeForLegend = function (legendHeight, legendWidth) {
    var $$ = this, config = $$.config, insetLegendPosition = {
        top: $$.isLegendTop ? $$.getCurrentPaddingTop() + config.legend_inset_y + 5.5 : $$.currentHeight - legendHeight - $$.getCurrentPaddingBottom() - config.legend_inset_y,
        left: $$.isLegendLeft ? $$.getCurrentPaddingLeft() + config.legend_inset_x + 0.5 : $$.currentWidth - legendWidth - $$.getCurrentPaddingRight() - config.legend_inset_x + 0.5
    };

    $$.margin3 = {
        top: $$.isLegendRight ? 0 : $$.isLegendInset ? insetLegendPosition.top : $$.currentHeight - legendHeight,
        right: NaN,
        bottom: 0,
        left: $$.isLegendRight ? $$.currentWidth - legendWidth : $$.isLegendInset ? insetLegendPosition.left : 0
    };
};
c3_chart_internal_fn.transformLegend = function (withTransition) {
    var $$ = this;
    (withTransition ? $$.legend.transition() : $$.legend).attr("transform", $$.getTranslate('legend'));
};
c3_chart_internal_fn.updateLegendStep = function (step) {
    this.legendStep = step;
};
c3_chart_internal_fn.updateLegendItemWidth = function (w) {
    this.legendItemWidth = w;
};
c3_chart_internal_fn.updateLegendItemHeight = function (h) {
    this.legendItemHeight = h;
};
c3_chart_internal_fn.getLegendWidth = function () {
    var $$ = this;
    return $$.config.legend_show ? $$.isLegendRight || $$.isLegendInset ? $$.legendItemWidth * ($$.legendStep + 1) : $$.currentWidth : 0;
};
c3_chart_internal_fn.getLegendHeight = function () {
    var $$ = this, h = 0;
    if ($$.config.legend_show) {
        if ($$.isLegendRight) {
            h = $$.currentHeight;
        } else {
            h = Math.max(20, $$.legendItemHeight) * ($$.legendStep + 1);
        }
    }
    return h;
};
c3_chart_internal_fn.opacityForLegend = function (legendItem) {
    return legendItem.classed(CLASS.legendItemHidden) ? null : 1;
};
c3_chart_internal_fn.opacityForUnfocusedLegend = function (legendItem) {
    return legendItem.classed(CLASS.legendItemHidden) ? null : 0.3;
};
c3_chart_internal_fn.toggleFocusLegend = function (targetIds, focus) {
    var $$ = this;
    targetIds = $$.mapToTargetIds(targetIds);
    $$.legend.selectAll('.' + CLASS.legendItem)
        .filter(function (id) { return targetIds.indexOf(id) >= 0; })
        .classed(CLASS.legendItemFocused, focus)
      .transition().duration(100)
        .style('opacity', function () {
            var opacity = focus ? $$.opacityForLegend : $$.opacityForUnfocusedLegend;
            return opacity.call($$, $$.d3.select(this));
        });
};
c3_chart_internal_fn.revertLegend = function () {
    var $$ = this, d3 = $$.d3;
    $$.legend.selectAll('.' + CLASS.legendItem)
        .classed(CLASS.legendItemFocused, false)
        .transition().duration(100)
        .style('opacity', function () { return $$.opacityForLegend(d3.select(this)); });
};
c3_chart_internal_fn.showLegend = function (targetIds) {
    var $$ = this, config = $$.config;
    if (!config.legend_show) {
        config.legend_show = true;
        $$.legend.style('visibility', 'visible');
        if (!$$.legendHasRendered) {
            $$.updateLegendWithDefaults();
        }
    }
    $$.removeHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds))
        .style('visibility', 'visible')
        .transition()
        .style('opacity', function () { return $$.opacityForLegend($$.d3.select(this)); });
};
c3_chart_internal_fn.hideLegend = function (targetIds) {
    var $$ = this, config = $$.config;
    if (config.legend_show && isEmpty(targetIds)) {
        config.legend_show = false;
        $$.legend.style('visibility', 'hidden');
    }
    $$.addHiddenLegendIds(targetIds);
    $$.legend.selectAll($$.selectorLegends(targetIds))
        .style('opacity', 0)
        .style('visibility', 'hidden');
};
c3_chart_internal_fn.clearLegendItemTextBoxCache = function () {
    this.legendItemTextBox = {};
};
c3_chart_internal_fn.updateLegend = function (targetIds, options, transitions) {
    var $$ = this, config = $$.config;
    var xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect, x1ForLegendTile, x2ForLegendTile, yForLegendTile;
    var paddingTop = 4, paddingRight = 10, maxWidth = 0, maxHeight = 0, posMin = 10, tileWidth = config.legend_item_tile_width + 5;
    var l, totalLength = 0, offsets = {}, widths = {}, heights = {}, margins = [0], steps = {}, step = 0;
    var withTransition, withTransitionForTransform;
    var texts, rects, tiles, background;
    var targetId, symbol;

    // Skip elements when their name is set to null
    targetIds = targetIds.filter(function(id) {
        return !isDefined(config.data_names[id]) || config.data_names[id] !== null;
    });

    options = options || {};
    withTransition = getOption(options, "withTransition", true);
    withTransitionForTransform = getOption(options, "withTransitionForTransform", true);

    function getTextBox(textElement, id) {
        if (!$$.legendItemTextBox[id]) {
            $$.legendItemTextBox[id] = $$.getTextRect(textElement.textContent, CLASS.legendItem, textElement);
        }
        return $$.legendItemTextBox[id];
    }

    function updatePositions(textElement, id, index) {
        var reset = index === 0, isLast = index === targetIds.length - 1,
            box = getTextBox(textElement, id),
            itemWidth = box.width + tileWidth + (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) + config.legend_padding,
            itemHeight = box.height + paddingTop,
            itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
            areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
            margin, maxLength;

        // MEMO: care about condifion of step, totalLength
        function updateValues(id, withoutStep) {
            if (!withoutStep) {
                margin = (areaLength - totalLength - itemLength) / 2;
                if (margin < posMin) {
                    margin = (areaLength - itemLength) / 2;
                    totalLength = 0;
                    step++;
                }
            }
            steps[id] = step;
            margins[step] = $$.isLegendInset ? 10 : margin;
            offsets[id] = totalLength;
            totalLength += itemLength;
        }

        if (reset) {
            totalLength = 0;
            step = 0;
            maxWidth = 0;
            maxHeight = 0;
        }

        if (config.legend_show && !$$.isLegendToShow(id)) {
            widths[id] = heights[id] = steps[id] = offsets[id] = 0;
            return;
        }

        widths[id] = itemWidth;
        heights[id] = itemHeight;

        if (!maxWidth || itemWidth >= maxWidth) { maxWidth = itemWidth; }
        if (!maxHeight || itemHeight >= maxHeight) { maxHeight = itemHeight; }
        maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;

        if (config.legend_equally) {
            Object.keys(widths).forEach(function (id) { widths[id] = maxWidth; });
            Object.keys(heights).forEach(function (id) { heights[id] = maxHeight; });
            margin = (areaLength - maxLength * targetIds.length) / 2;
            if (margin < posMin) {
                totalLength = 0;
                step = 0;
                targetIds.forEach(function (id) { updateValues(id); });
            }
            else {
                updateValues(id, true);
            }
        } else {
            updateValues(id);
        }
    }

    if ($$.isLegendInset) {
        step = config.legend_inset_step ? config.legend_inset_step : targetIds.length;
        $$.updateLegendStep(step);
    }

    if ($$.isLegendRight) {
        xForLegend = function (id) { return maxWidth * steps[id]; };
        yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
    } else if ($$.isLegendInset) {
        xForLegend = function (id) { return maxWidth * steps[id] + 10; };
        yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
    } else {
        xForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
        yForLegend = function (id) { return maxHeight * steps[id]; };
    }
    xForLegendText = function (id, i) { return xForLegend(id, i) + 4 + config.legend_item_tile_width; };
    yForLegendText = function (id, i) { return yForLegend(id, i) + 9; };
    xForLegendRect = function (id, i) { return xForLegend(id, i); };
    yForLegendRect = function (id, i) { return yForLegend(id, i) - 5; };
    x1ForLegendTile = function (id, i) { return xForLegend(id, i) - 2; };
    x2ForLegendTile = function (id, i) { return xForLegend(id, i) - 2 + config.legend_item_tile_width; };
    yForLegendTile = function (id, i) { return yForLegend(id, i) + 4; };

    // Define g for legend area
    l = $$.legend.selectAll('.' + CLASS.legendItem)
        .data(targetIds)
        .enter().append('g')
        .attr('class', function (id) { return $$.generateClass(CLASS.legendItem, id); })
        .style('visibility', function (id) { return $$.isLegendToShow(id) ? 'visible' : 'hidden'; })
        .style('cursor', 'pointer')
        .on('click', function (id) {
            if (config.legend_item_onclick) {
                config.legend_item_onclick.call($$, id);
            } else {
                if ($$.d3.event.altKey) {
                    $$.api.hide();
                    $$.api.show(id);
                } else {
                    $$.api.toggle(id);
                    $$.isTargetToShow(id) ? $$.api.focus(id) : $$.api.revert();
                }
            }
        })
        .on('mouseover', function (id) {
            if (config.legend_item_onmouseover) {
                config.legend_item_onmouseover.call($$, id);
            }
            else {
                $$.d3.select(this).classed(CLASS.legendItemFocused, true);
                if (!$$.transiting && $$.isTargetToShow(id)) {
                    $$.api.focus(id);
                }
            }
        })
        .on('mouseout', function (id) {
            if (config.legend_item_onmouseout) {
                config.legend_item_onmouseout.call($$, id);
            }
            else {
                $$.d3.select(this).classed(CLASS.legendItemFocused, false);
                $$.api.revert();
            }
        });

    l.append('text')
        .text(function (id) { return isDefined(config.data_names[id]) ? config.data_names[id] : id; })
        .each(function (id, i) { updatePositions(this, id, i); })
        .style("pointer-events", "none");
    l.append('rect')
        .attr("class", CLASS.legendItemEvent)
        .style('fill-opacity', 0);

    var r = config.legend_item_tile_height / 2;

    for (var j = 0; j < targetIds.length; j++) {
        targetId = targetIds[j];
        var legendItem = $$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(targetId)).selectAll('.' + CLASS.legendItemTile).data([targetId]);
        var legendItemLine = $$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(targetId)).selectAll('.' + CLASS.legendItemTile + '-line').data([targetId]);

        var enterTarget = legendItem.enter();


        if(!config.data_symbols) {
            enterTarget.append('line')
                .attr('class', CLASS.legendItemTile)
                .style('stroke', $$.color)
                .style("pointer-events", "none")
                .attr('stroke-width', config.legend_item_tile_height);

        } else {
            symbol = $$.getSymbolForTarget(targetId);

            if(symbol === 'circle') {
                enterTarget.append('circle')
                    .attr('class', CLASS.legendItemTile)
                    .attr('r', r)
                    .style('fill', $$.color)
                    .style('pointer-events', 'none');
            } else {
                enterTarget.append('polygon')
                    .attr('class', CLASS.legendItemTile)
                    .style('fill', $$.color)
                    .style('pointer-events', 'none');

            }
        }

        legendItemLine.enter().append('line')
            .attr('class', CLASS.legendItemTile + '-line')
            .style('stroke', $$.color)
            .style("pointer-events", "none");

        legendItemLine.exit().remove();
        legendItem.exit().remove();
    }

    // Set background for inset legend
    background = $$.legend.select('.' + CLASS.legendBackground + ' rect');
    if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
        background = $$.legend.insert('g', '.' + CLASS.legendItem)
            .attr("class", CLASS.legendBackground)
            .append('rect');
    }

    texts = $$.legend.selectAll('text')
        .data(targetIds)
        .text(function (id) { return isDefined(config.data_names[id]) ? config.data_names[id] : id; }) // MEMO: needed for update
        .each(function (id, i) { updatePositions(this, id, i); });
    (withTransition ? texts.transition() : texts)
        .attr('x', xForLegendText)
        .attr('y', yForLegendText);

    rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent)
        .data(targetIds);
    (withTransition ? rects.transition() : rects)
        .attr('width', function (id) { return widths[id]; })
        .attr('height', function (id) { return heights[id]; })
        .attr('x', xForLegendRect)
        .attr('y', yForLegendRect);

    if(!config.data_symbols) {
        tiles = $$.legend.selectAll('line.' + CLASS.legendItemTile)
            .data(targetIds);
        (withTransition ? tiles.transition() : tiles)
            .style('stroke', $$.color)
            .attr('x1', x1ForLegendTile)
            .attr('y1', yForLegendTile)
            .attr('x2', x2ForLegendTile)
            .attr('y2', yForLegendTile);
    } else {
        for(var k = 0; k < targetIds.length; k++) {
            targetId = targetIds[k];
            symbol = $$.getSymbolForTarget(targetId);

            var x1 = x1ForLegendTile(targetId, k);
            var x2 = x2ForLegendTile(targetId, k);
            var y = yForLegendTile(targetId, k);

            var cx = (x1 + x2) / 2;

            var tile;

            if(symbol === 'circle') {
                tile = $$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(targetId) + ' circle.' + CLASS.legendItemTile);
                (withTransition ? tile.transition() : tile)
                    .attr('cx', cx)
                    .attr('cy', y);
            } else {
                var points = $$.buildPointsArray(symbol, cx, y, r);

                var pointsString = points.map(function(d) {
                    return [d.x,d.y].join(",");
                }).join(" ");

                tile = $$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(targetId) + ' polygon.' + CLASS.legendItemTile);
                (withTransition ? tile.transition() : tile)
                    .attr('points', pointsString);
            }

            var line = $$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(targetId) + ' line.' + CLASS.legendItemTile + '-line');
            (withTransition ? line.transition() : line)
                .attr('x1', x1 - 5)
                .attr('x2', x2 + 5)
                .attr('y1', y)
                .attr('y2', y);

        }
    }

    if (background) {
        (withTransition ? background.transition() : background)
            .attr('height', $$.getLegendHeight() - 12)
            .attr('width', maxWidth * (step + 1) + 10);
    }

    // toggle legend state
    $$.legend.selectAll('.' + CLASS.legendItem)
        .classed(CLASS.legendItemHidden, function (id) { return !$$.isTargetToShow(id); });

    // Update all to reflect change of legend
    $$.updateLegendItemWidth(maxWidth);
    $$.updateLegendItemHeight(maxHeight);
    $$.updateLegendStep(step);
    // Update size and scale
    $$.updateSizes();
    $$.updateScales();
    $$.updateSvgSize();
    // Update g positions
    $$.transformAll(withTransitionForTransform, transitions);
    $$.legendHasRendered = true;
};
