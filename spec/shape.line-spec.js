describe('c3 chart shape line', function () {
    'use strict';

    var chart, args;

    beforeEach(function (done) {
        chart = window.initChart(chart, args, done);
    });

    var parseSvgPath = window.parseSvgPath;

    describe('custom symbol rendering for line chart', function () {
        it('should update args', function() {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125],
                        ['data4', 30, 200, 100, 400, -150, 250],
                        ['data5', 50, 20, 10, 40, 15, 25],
                        ['data6', -150, 120, 110, 140, 115, 125],
                        ['data7', 30, 200, 100, 400, -150, 250],
                        ['data8', 50, 20, 10, 40, 15, 25],
                        ['data9', -150, 120, 110, 140, 115, 125],
                        ['data10', 30, 200, 100, 400, -150, 250],
                        ['data11', 50, 20, 10, 40, 15, 25]
                    ],
                    type: 'line',
                    symbols: {
                        'data1' : 'circle',
                        'data2': 'triangle',
                        'data3' : 'square',
                        'data4': 'x',
                        'data5' : 'diamond',
                        'data6': 'cross',
                        'data7' : 'bar',
                        'data8': 'vertical-bar',
                        'data9' : 'triangle-down',
                        'data10': 'triangle-left',
                        'data11' : 'triangle-right'
                    }
                }
            };

            expect(true).toBeTruthy();
        });

        it('should render circles', function() {
            var target = chart.internal.main.select('.c3-circles-data1');

            var point = target.select('.c3-circle-0');

            expect(point.attr('r')).toBe('2.5');
        });

        it('should render triangles', function() {
            var target = chart.internal.main.select('.c3-circles-data2');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(3);
        });

        it('should render squares', function() {
            var target = chart.internal.main.select('.c3-circles-data3');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(4);
        });

        it('should render xs', function() {
            var target = chart.internal.main.select('.c3-circles-data4');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(12);
        });

        it('should render diamonds', function() {
            var target = chart.internal.main.select('.c3-circles-data5');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(4);
        });

        it('should render crosses', function() {
            var target = chart.internal.main.select('.c3-circles-data6');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(12);
        });

        it('should render bars', function() {
            var target = chart.internal.main.select('.c3-circles-data7');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(4);
        });

        it('should render vertical bars', function() {
            var target = chart.internal.main.select('.c3-circles-data8');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(4);
        });

        it('should render downward triangles', function() {
            var target = chart.internal.main.select('.c3-circles-data9');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(3);
        });

        it('should render left triangles', function() {
            var target = chart.internal.main.select('.c3-circles-data10');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(3);
        });

        it('should render right triangles', function() {
            var target = chart.internal.main.select('.c3-circles-data11');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points').split(' ');

            expect(points.length).toBe(3);
        });

        it('should expand/unexpand circles', function() {
            var target = chart.internal.main.select('.c3-circles-data1');

            var point = target.select('.c3-circle-0');

            expect(point.attr('r')).toBe('2.5');

            chart.internal.expandCircles(0, 'data1');

            expect(point.attr('r')).toBe('4.375');

            chart.internal.unexpandCircles(0);

            expect(point.attr('r')).toBe('2.5');
        });

        it('should expand/unexpand polygons', function() {
            var target = chart.internal.main.select('.c3-circles-data3');

            var point = target.select('.c3-circle-0');

            var points = point.attr('points');

            expect(points.split(' ').length).toBe(4);

            chart.internal.expandCircles(0, 'data3');

            points = point.attr('points');

            expect(points.split(' ').length).toBe(4);

            chart.internal.unexpandCircles(0);

            points = point.attr('points');

            expect(points.split(' ').length).toBe(4);
        });
    });

    describe('shape-rendering for line chart', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'line'
                }
            };
            expect(true).toBeTruthy();

        });

        it("Should render the lines correctly", function(done) {
             setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                var commands = parseSvgPath( target.select('.c3-line-data1').attr('d'));
                expect(commands.length).toBe(6);
                done();
            }, 500);
        });

        it("should not have shape-rendering when it's line chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering');
                expect(style).toBe('auto');
            });
        });

        it('should change to step chart', function () {
            args.data.type = 'step';
            expect(true).toBeTruthy();
        });

        it("should have shape-rendering = crispedges when it's step chart", function () {
            d3.selectAll('.c3-line').each(function () {
                var style = d3.select(this).style('shape-rendering').toLowerCase();
                expect(style).toBe('crispedges');
            });
        });

        it('should change to spline chart', function () {
            args.data.type = 'spline';
            expect(true).toBeTruthy();
        });

        it('should use cardinal interpolation by default', function () {
            expect(chart.internal.config.spline_interpolation_type).toBe('cardinal');
        });

    });

    describe('point.show option', function () {

        it('should change args to include null data', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, null, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'line'
                }
            };
            expect(true).toBeTruthy();
        });

        it('should not show the circle for null', function (done) {
            setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                expect(+target.select('.c3-circle-0').style('opacity')).toBe(1);
                expect(+target.select('.c3-circle-1').style('opacity')).toBe(0);
                expect(+target.select('.c3-circle-2').style('opacity')).toBe(1);
                done();
            }, 500);
        });

        it('should not draw a line segment for null data', function(done) {
            setTimeout(function () {
                var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
                var commands = parseSvgPath( target.select('.c3-line-data1').attr('d'));
                var segments = 0;
                for(var i = 0; i < commands.length; i++) {
                    (commands[i].command === 'L') ? segments++ : null;
                }
                expect(segments).toBe(3);
                done();
            }, 500);
        });

        // it('should change args to include null data on scatter plot', function () {
        //     args = {
        //         data: {
        //             columns: [
        //                 ['data1', 30, null, 100, 400, -150, 250],
        //                 ['data2', 50, 20, 10, 40, 15, 25],
        //                 ['data3', -150, 120, 110, 140, 115, 125]
        //             ],
        //             type: 'scatter'
        //         }
        //     };
        //     expect(true).toBeTruthy();
        // });

        // it('should not show the circle for null', function (done) {
        //     setTimeout(function () {
        //         var target = chart.internal.main.select('.c3-chart-line.c3-target-data1');
        //         expect(+target.select('.c3-circle-0').style('opacity')).toBe(0.5);
        //         expect(+target.select('.c3-circle-1').style('opacity')).toBe(0);
        //         expect(+target.select('.c3-circle-2').style('opacity')).toBe(0.5);
        //         done();
        //     }, 500);
        // });

    });

    describe('spline.interpolation option', function () {

        it('should update args', function () {
            args = {
                data: {
                    columns: [
                        ['data1', 30, 200, 100, 400, -150, 250],
                        ['data2', 50, 20, 10, 40, 15, 25],
                        ['data3', -150, 120, 110, 140, 115, 125]
                    ],
                    type: 'spline'
                },
                spline: {
                    interpolation: {
                        type: 'monotone'
                    }
                }
            };

            expect(true).toBeTruthy();
        });

        it('should update interpolation function', function() {
            expect(chart.internal.getInterpolate(chart.data()[0])).toBe('monotone');
        });

        it('should not use a non-valid interpolation', function () {
            args.spline.interpolation.type = 'foo';
            expect(true).toBeTruthy();
        });

        it('should use cardinal interpolation when given option is not valid', function() {
            expect(chart.internal.getInterpolate(chart.data()[0])).toBe('cardinal');
        });

    });

});
