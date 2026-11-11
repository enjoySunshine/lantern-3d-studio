import { expect } from 'chai';

import { DefaultAnimBinder } from '../../../../src/framework/anim/binder/default-anim-binder.js';
import { INTERPOLATION_LINEAR } from '../../../../src/framework/anim/constants.js';
import { AnimBlendTree1D } from '../../../../src/framework/anim/controller/anim-blend-tree-1d.js';
import { AnimBlendTreeCartesian2D } from '../../../../src/framework/anim/controller/anim-blend-tree-2d-cartesian.js';
import { AnimBlendTreeDirectional2D } from '../../../../src/framework/anim/controller/anim-blend-tree-2d-directional.js';
import { AnimBlendTreeDirect } from '../../../../src/framework/anim/controller/anim-blend-tree-direct.js';
import { AnimBlendTree } from '../../../../src/framework/anim/controller/anim-blend-tree.js';
import { AnimController } from '../../../../src/framework/anim/controller/anim-controller.js';
import { AnimState } from '../../../../src/framework/anim/controller/anim-state.js';
import { ANIM_BLEND_1D } from '../../../../src/framework/anim/controller/constants.js';
import { AnimCurve } from '../../../../src/framework/anim/evaluator/anim-curve.js';
import { AnimData } from '../../../../src/framework/anim/evaluator/anim-data.js';
import { AnimEvaluator } from '../../../../src/framework/anim/evaluator/anim-evaluator.js';
import { AnimTrack } from '../../../../src/framework/anim/evaluator/anim-track.js';
import { GraphNode } from '../../../../src/scene/graph-node.js';

describe('AnimBlendTree', function () {
    const findParameter = () => {};
    const animState = new AnimState({ findParameter }, 'state', 1, true, null);
    const animBlendTree = new AnimBlendTree(animState, null, 'blendTree', 1, ['blendParam'], [
        {
            'name': 'child1',
            'point': 0.0
        },
        {
            'name': 'child2',
            'point': 1.0
        }
    ], false, animState._createTree, findParameter);

    describe('#constructor', function () {

        it('instantiates correctly', function () {
            expect(animBlendTree).to.be.ok;
        });

    });

    describe('#getChild', function () {

        it('can retrieve a child by name', function () {
            expect(animBlendTree.getChild('child1').name).to.equal('child1');
            expect(animBlendTree.getChild('child2').name).to.equal('child2');
        });

        it('returns null when a child is not found', function () {
            expect(animBlendTree.getChild('child3')).to.equal(null);
        });

    });

    describe('#getNodeCount', function () {

        it('returns the count of children in the blend tree', function () {
            expect(animBlendTree.getNodeCount()).to.equal(2);
        });

    });

    describe('#updateParameterValues', function () {

        it('parameters are not set before it is called', function () {
            const params = {
                'param1': {
                    value: 'value1'
                },
                'param2': {
                    value: 'value2'
                }
            };
            const findParameter = (name) => {
                return params[name];
            };
            const animState = new AnimState({ findParameter }, 'state', 1, true, null);
            const animBlendTree = new AnimBlendTree(animState, null, 'blendTree', 1, ['param1', 'param2'], [], false, animState._createTree, findParameter);

            expect(animBlendTree._parameterValues[0]).to.not.be.equal('value1');
            expect(animBlendTree._parameterValues[1]).to.not.be.equal('value2');
        });

        it('can set any updated parameters in the blend tree', function () {
            const params = {
                'param1': {
                    value: 'value1'
                },
                'param2': {
                    value: 'value2'
                }
            };
            const findParameter = (name) => {
                return params[name];
            };
            const animState = new AnimState({ findParameter }, 'state', 1, true, null);
            const animBlendTree = new AnimBlendTree(animState, null, 'blendTree', 1, ['param1', 'param2'], [], false, animState._createTree, findParameter);

            animBlendTree.updateParameterValues();
            expect(animBlendTree._parameterValues).to.deep.equal(['value1', 'value2']);
            params.param2.value = 'value3';
            expect(animBlendTree._parameterValues[1]).to.equal('value2');
            animBlendTree.updateParameterValues();
            expect(animBlendTree._parameterValues[1]).to.equal('value3');
        });

        it('returns false when stored parameters are already up to date', function () {
            const params = {
                'param1': {
                    value: 'value1'
                },
                'param2': {
                    value: 'value2'
                }
            };
            const findParameter = (name) => {
                return params[name];
            };
            const animState = new AnimState({ findParameter }, 'state', 1, true, null);
            const animBlendTree = new AnimBlendTree(animState, null, 'blendTree', 1, ['param1', 'param2'], [], false, animState._createTree, findParameter);

            const result = animBlendTree.updateParameterValues();
            expect(result).to.equal(false);
        });

        it('returns true when stored parameters are already up to date', function () {
            const params = {
                'param1': {
                    value: 'value1'
                },
                'param2': {
                    value: 'value2'
                }
            };
            const findParameter = (name) => {
                return params[name];
            };
            const animState = new AnimState({ findParameter }, 'state', 1, true, null);
            const animBlendTree = new AnimBlendTree(animState, null, 'blendTree', 1, ['param1', 'param2'], [], false, animState._createTree, findParameter);

            let result = animBlendTree.updateParameterValues();
            expect(result).to.equal(false);
            result = animBlendTree.updateParameterValues();
            expect(result).to.equal(true);
        });

    });

});

describe('AnimBlendTree1D', function () {
    const params = {
        'blendParam': {
            value: 0.5
        }
    };
    const findParameter = (name) => {
        return params[name];
    };
    const animState = new AnimState({ findParameter }, 'state', 1, true, null);
    const animBlendTree = new AnimBlendTree1D(animState, null, 'blendTree', 1, ['blendParam'], [
        {
            'name': 'child1',
            'point': 0.0
        },
        {
            'name': 'child2',
            'point': 1.0
        }
    ], false, animState._createTree, findParameter);

    describe('#calculateWeights', function () {

        it('produces equal weights when the parameter is at the midpoint of both children', function () {
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.5);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.5);
        });

        it('produces unequal weights when the parameter is not the midpoint of both children', function () {
            params.blendParam.value = 0.25;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.75);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.25);
        });

        it('produces correct results when a parameter is the same as the point of a child', function () {
            params.blendParam.value = 1;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0);
            expect(animBlendTree.getChild('child2').weight).to.equal(1);
        });

    });
});

describe('AnimBlendTreeDirect', function () {
    const params = {
        'blendParam1': {
            value: 0.5
        },
        'blendParam2': {
            value: 0.5
        }
    };
    const findParameter = (name) => {
        return params[name];
    };
    const animState = new AnimState({ findParameter }, 'state', 1, true, null);
    const animBlendTree = new AnimBlendTreeDirect(animState, null, 'blendTree', 1, ['blendParam1', 'blendParam2'], [
        {
            'name': 'child1'
        },
        {
            'name': 'child2'
        }
    ], false, animState._createTree, findParameter);

    describe('#calculateWeights', function () {

        it('produces equal weights when the parameters are equal', function () {
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.5);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.5);
        });

        it('produces unequal weights when the parameters are not equal', function () {
            params.blendParam1.value = 0.75;
            params.blendParam2.value = 0.25;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.75);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.25);
        });

        it('produces a zero weight for single parameters that are zero', function () {
            params.blendParam1.value = 1;
            params.blendParam2.value = 0;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(1);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

        it('produces zero weights when all parameters are zero', function () {
            params.blendParam1.value = 0;
            params.blendParam2.value = 0;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

    });

});

describe('AnimBlendTreeCartesian2D', function () {
    const params = {
        'blendParam1': {
            value: 0
        },
        'blendParam2': {
            value: 0
        }
    };
    const findParameter = (name) => {
        return params[name];
    };
    const animState = new AnimState({ findParameter }, 'state', 1, true, null);
    const animBlendTree = new AnimBlendTreeCartesian2D(animState, null, 'blendTree', 1, ['blendParam1', 'blendParam2'], [
        {
            'name': 'child1',
            point: [0, 1]
        },
        {
            'name': 'child2',
            point: [0, -1]
        }
    ], false, animState._createTree, findParameter);

    describe('#calculateWeights', function () {

        it('produces equal weights when the parameters are equal', function () {
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.5);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.5);
        });

        it('produces unequal weights when the parameters are not equal', function () {
            params.blendParam2.value = 0.5;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.75);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.25);
        });

        it('produces a zero weight for single parameters that are zero', function () {
            params.blendParam2.value = 1;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(1);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

        it('produces a zero weights when all parameters are zero', function () {
            params.blendParam1.value = 0;
            params.blendParam2.value = 0;
            animBlendTree._children[0]._point = [0, 0];
            animBlendTree._children[1]._point = [0, 0];
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

    });

});

describe('AnimBlendTreeDirectional2D', function () {

    const params = {
        'blendParam1': {
            value: 0
        },
        'blendParam2': {
            value: 0
        }
    };
    const findParameter = (name) => {
        return params[name];
    };
    const animState = new AnimState({ findParameter }, 'state', 1, true, null);
    const animBlendTree = new AnimBlendTreeDirectional2D(animState, null, 'blendTree', 1, ['blendParam1', 'blendParam2'], [
        {
            'name': 'child1',
            point: [0, 1]
        },
        {
            'name': 'child2',
            point: [0, -1]
        }
    ], false, animState._createTree, findParameter);

    describe('#calculateWeights', function () {

        it('produces equal weights when the parameters are equal', function () {
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0.5);
            expect(animBlendTree.getChild('child2').weight).to.equal(0.5);
        });

        it('produces unequal weights when the parameters are not equal', function () {
            params.blendParam2.value = 0.5;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(1);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

        it('produces a zero weight for single parameters that are zero', function () {
            params.blendParam2.value = 1;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(1);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

        it('produces a zero weights when all parameters are zero', function () {
            params.blendParam1.value = 0;
            params.blendParam2.value = 0;
            animBlendTree._children[0]._point = [0, 0];
            animBlendTree._children[1]._point = [0, 0];
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('child1').weight).to.equal(0);
            expect(animBlendTree.getChild('child2').weight).to.equal(0);
        });

    });

});

describe('AnimBlendTree1D out of range parameters', function () {
    const params = {
        'speed': {
            value: 0.5
        }
    };
    const findParameter = (name) => {
        return params[name];
    };
    let animBlendTree;

    beforeEach(function () {
        params.speed.value = 0.5;
        const animState = new AnimState({ findParameter }, 'state', 1, true, null);
        animBlendTree = new AnimBlendTree1D(animState, null, 'blendTree', 1, ['speed'], [
            {
                'name': 'idle',
                'point': 0.0
            },
            {
                'name': 'walk',
                'point': 1.0
            },
            {
                'name': 'run',
                'point': 2.0
            }
        ], false, animState._createTree, findParameter);
    });

    describe('#calculateWeights', function () {

        it('blends the bracketing children when the parameter is within range', function () {
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('idle').weight).to.equal(0.5);
            expect(animBlendTree.getChild('walk').weight).to.equal(0.5);
            expect(animBlendTree.getChild('run').weight).to.equal(0);

            params.speed.value = 1.5;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('idle').weight).to.equal(0);
            expect(animBlendTree.getChild('walk').weight).to.equal(0.5);
            expect(animBlendTree.getChild('run').weight).to.equal(0.5);
        });

        it('gives the last child full weight when the parameter exceeds the last point', function () {
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('walk').weight).to.equal(0.5);

            params.speed.value = 3;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('idle').weight).to.equal(0);
            expect(animBlendTree.getChild('walk').weight).to.equal(0);
            expect(animBlendTree.getChild('run').weight).to.equal(1);
        });

        it('gives the first child full weight when the parameter falls below the first point', function () {
            params.speed.value = 1;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('walk').weight).to.equal(1);

            params.speed.value = -0.5;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('idle').weight).to.equal(1);
            expect(animBlendTree.getChild('walk').weight).to.equal(0);
            expect(animBlendTree.getChild('run').weight).to.equal(0);
        });

        it('clamps parameters far outside the range to the nearest end child', function () {
            params.speed.value = 100;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('run').weight).to.equal(1);

            params.speed.value = -100;
            animBlendTree.calculateWeights();
            expect(animBlendTree.getChild('idle').weight).to.equal(1);
        });

    });

});

describe('nested AnimBlendTrees', function () {
    const params = {
        'speed': {
            value: 1.5
        },
        'strafe': {
            value: 0.5
        }
    };
    const findParameter = (name) => {
        return params[name];
    };

    // a 1D locomotion tree whose run child is itself a 1D tree blending between two run
    // animations on a second parameter
    const createState = (syncAnimations = false) => {
        return new AnimState({ findParameter }, 'Move', 1, true, {
            type: ANIM_BLEND_1D,
            parameter: 'speed',
            syncAnimations,
            children: [
                {
                    'name': 'idle',
                    'point': 0.0
                },
                {
                    'name': 'walk',
                    'point': 1.0
                },
                {
                    'name': 'run',
                    'point': 2.0,
                    'type': ANIM_BLEND_1D,
                    'parameter': 'strafe',
                    'syncAnimations': syncAnimations,
                    'children': [
                        {
                            'name': 'runForward',
                            'point': 0.0
                        },
                        {
                            'name': 'runSide',
                            'point': 1.0
                        }
                    ]
                }
            ]
        });
    };

    beforeEach(function () {
        params.speed.value = 1.5;
        params.strafe.value = 0.5;
    });

    it('places the child blend tree at its own point in the parent tree', function () {
        const animState = createState();
        expect(animState._blendTree.getChild('run').point).to.equal(2);
    });

    it('counts the leaf nodes of nested blend trees recursively', function () {
        const animState = createState();
        expect(animState.nodeCount).to.equal(4);
    });

    it('multiplies the weights of parent and child blend trees', function () {
        const animState = createState();
        const blendTree = animState._blendTree;
        const run = blendTree.getChild('run');
        expect(blendTree.getChild('idle').weight).to.equal(0);
        expect(blendTree.getChild('walk').weight).to.equal(0.5);
        expect(run.weight).to.equal(0.5);
        // the outer tree gives the nested tree a weight of 0.5, so its children each hold
        // half of that in the overall blend
        expect(run.getChild('runForward').weight).to.equal(0.25);
        expect(run.getChild('runSide').weight).to.equal(0.25);
    });

    it('gives the nested blend tree full weight at its own point', function () {
        params.speed.value = 2;
        const animState = createState();
        const blendTree = animState._blendTree;
        const run = blendTree.getChild('run');
        expect(blendTree.getChild('walk').weight).to.equal(0);
        expect(run.weight).to.equal(1);
        expect(run.getChild('runForward').weight).to.equal(0.5);
        expect(run.getChild('runSide').weight).to.equal(0.5);
    });

    it('clamps out of range parameters to the nested blend tree', function () {
        const animState = createState();
        const blendTree = animState._blendTree;
        const run = blendTree.getChild('run');

        params.speed.value = 3;
        expect(blendTree.getChild('idle').weight).to.equal(0);
        expect(blendTree.getChild('walk').weight).to.equal(0);
        expect(run.getChild('runForward').weight).to.equal(0.5);
        expect(run.getChild('runSide').weight).to.equal(0.5);

        params.speed.value = -0.5;
        expect(blendTree.getChild('idle').weight).to.equal(1);
        expect(blendTree.getChild('walk').weight).to.equal(0);
        expect(run.getChild('runForward').weight).to.equal(0);
        expect(run.getChild('runSide').weight).to.equal(0);
    });

    it('does not recalculate weights while its parameters are unchanged', function () {
        const animState = createState();
        const runForward = animState._blendTree.getChild('run').getChild('runForward');
        expect(runForward.weight).to.equal(0.25);

        // overwrite the calculated weight; it must survive re-reads while no parameter changes
        runForward._weight = 0.75;
        expect(runForward.weight).to.equal(0.375);

        // changing a parameter recalculates the weights
        params.strafe.value = 0.75;
        expect(runForward.weight).to.equal(0.125);
    });

    it('synchronizes animation speeds across nested blend trees', function () {
        const animState = createState(true);
        animState.addAnimation(['Move', 'idle'], new AnimTrack('idleTrack', 1, [], [], []));
        animState.addAnimation(['Move', 'walk'], new AnimTrack('walkTrack', 1, [], [], []));
        animState.addAnimation(['Move', 'run', 'runForward'], new AnimTrack('runForwardTrack', 2, [], [], []));
        animState.addAnimation(['Move', 'run', 'runSide'], new AnimTrack('runSideTrack', 1, [], [], []));
        const run = animState._blendTree.getChild('run');
        const runForward = run.getChild('runForward');
        const runSide = run.getChild('runSide');

        // reading the weights calculates them together with the synchronized speeds
        expect(runForward.weight).to.equal(0.25);
        // the nested tree's synchronization factor (1.2) multiplies its children's own
        // factors (4/3 and 2/3)
        expect(runForward.speed).to.be.closeTo(1.6, 1e-9);
        expect(runSide.speed).to.be.closeTo(0.8, 1e-9);
    });

});

describe('AnimBlendTree controller integration', function () {

    // builds a controller with a single Move blend tree state whose clips each hold the hips
    // node at a constant x position, so the blended x reads out the blend result directly
    const createController = (blendTree, paramValues) => {
        const root = new GraphNode('root');
        const hips = new GraphNode('hips');
        root.addChild(hips);
        const binder = new DefaultAnimBinder(root);
        // DefaultAnimBinder has no rebind, which the evaluator calls when tracks are assigned
        binder.rebind = () => {};
        const animEvaluator = new AnimEvaluator(binder);
        const parameters = {};
        for (const name in paramValues) {
            parameters[name] = {
                name,
                type: 'FLOAT',
                value: paramValues[name]
            };
        }
        const controller = new AnimController(
            animEvaluator,
            [
                { name: 'START' },
                { name: 'Move', blendTree }
            ],
            [{ from: 'START', to: 'Move' }],
            true, // activate
            null, // event handler
            name => parameters[name],
            () => {}
        );
        return { controller, hips, parameters };
    };

    const constantTrack = (name, x) => {
        const curve = new AnimCurve([{
            entityPath: ['hips'],
            component: 'graph',
            propertyPath: ['localPosition']
        }], 0, 0, INTERPOLATION_LINEAR);
        return new AnimTrack(name, 1, [new AnimData(1, [0, 1])], [new AnimData(3, [x, 0, 0, x, 0, 0])], [curve]);
    };

    it('plays the nearest end child when a 1D blend parameter leaves the children\'s range', function () {
        const { controller, hips, parameters } = createController({
            type: ANIM_BLEND_1D,
            parameter: 'speed',
            syncAnimations: false,
            children: [
                { name: 'idle', point: 0 },
                { name: 'walk', point: 1 },
                { name: 'run', point: 2 }
            ]
        }, { speed: 0.5 });
        controller.assignAnimation('Move.idle', constantTrack('idle', 0));
        controller.assignAnimation('Move.walk', constantTrack('walk', 10));
        controller.assignAnimation('Move.run', constantTrack('run', 20));
        controller.play('Move');

        controller.update(0.1);
        expect(hips.localPosition.x).to.equal(5);

        // sprint: the parameter overshoots the run point, so the run clip plays in full
        parameters.speed.value = 3;
        controller.update(0.1);
        expect(hips.localPosition.x).to.equal(20);

        // knockback: the parameter undershoots the idle point, so the idle clip plays in full
        parameters.speed.value = -0.5;
        controller.update(0.1);
        expect(hips.localPosition.x).to.equal(0);
    });

    [false, true].forEach((syncAnimations) => {
        it(`blends across nested blend trees (syncAnimations ${syncAnimations})`, function () {
            const { controller, hips, parameters } = createController({
                type: ANIM_BLEND_1D,
                parameter: 'speed',
                syncAnimations,
                children: [
                    { name: 'idle', point: 0 },
                    { name: 'walk', point: 1 },
                    {
                        name: 'run',
                        point: 2,
                        type: ANIM_BLEND_1D,
                        parameter: 'strafe',
                        syncAnimations,
                        children: [
                            { name: 'runForward', point: 0 },
                            { name: 'runSide', point: 1 }
                        ]
                    }
                ]
            }, { speed: 1.5, strafe: 0.5 });
            controller.assignAnimation('Move.idle', constantTrack('idle', 0));
            controller.assignAnimation('Move.walk', constantTrack('walk', 10));
            controller.assignAnimation('Move.run.runForward', constantTrack('runForward', 20));
            controller.assignAnimation('Move.run.runSide', constantTrack('runSide', 30));
            controller.play('Move');

            // walk 0.5, runForward 0.25, runSide 0.25
            controller.update(0.1);
            expect(hips.localPosition.x).to.equal(16.875);

            // the nested tree's own point plays only its children
            parameters.speed.value = 2;
            controller.update(0.1);
            expect(hips.localPosition.x).to.equal(25);

            // beyond the last point the nested tree keeps full weight
            parameters.speed.value = 3;
            controller.update(0.1);
            expect(hips.localPosition.x).to.equal(25);

            // below the first point the idle clip plays in full
            parameters.speed.value = -0.5;
            controller.update(0.1);
            expect(hips.localPosition.x).to.equal(0);
        });
    });

});
