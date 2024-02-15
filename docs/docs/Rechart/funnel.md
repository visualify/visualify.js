<script defers>

const Basic_Funnel = {
    code: `const getOption = () => {
    return {
        type: 'funnel',
        data: {
            'Funnel': [
                { value: 60, name: 'APP' },
                { value: 40, name: 'PC' },
                { value: 20, name: 'Mobile' },
                { value: 80, name: 'Wechat' },
                { value: 100, name: 'Mini App' }
            ],
        },
	}
};
return getOption;`
};

const Pyramid_Funnel = {
    code: `const getOption = () => {
    return {
        type: 'funnel',
        data: {
            'Funnel': [
                { value: 60, name: 'APP' },
                { value: 40, name: 'PC' },
                { value: 20, name: 'Mobile' },
                { value: 80, name: 'Wechat' },
                { value: 100, name: 'Mini App' }
            ],
        },
        sort: 'ascending',
        gap: 5,
	}
};
return getOption;`
};

const More_Funnel = {
    code: `const getOption = () => {
    return {
        type: 'funnel',
        data: {
            'Funnel': [
                { value: 60, name: 'APP' },
                { value: 40, name: 'PC' },
                { value: 20, name: 'Mobile' },
                { value: 80, name: 'Wechat' },
                { value: 100, name: 'Mini App' }
            ],
        },
        funnelAlign: 'left',
        max: 99,
        min: 5,
        label: {
            show: true,
            position: 'outside',
            fontSize: 12,
        },
        width: '70%',
	}
};
return getOption;`
};

const Contrast_funnel = {
    code: `const getOption = () => {
    return {
        type: 'funnel',
        data: {
            'Funnel 1': [
                { value: 60, name: 'APP' },
                { value: 40, name: 'PC' },
                { value: 20, name: 'Mobile' },
                { value: 80, name: 'Wechat' },
                { value: 100, name: 'Mini App' }
            ],
            'Funnel 2': [
                { value: 30, name: 'APP' },
                { value: 10, name: 'PC' },
                { value: 5, name: 'Mobile' },
                { value: 50, name: 'Wechat' },
                { value: 80, name: 'Mini App' }
            ],
        },
        width: '80%',
        z: [undefined, 100],
        emphasis: [
            {
                label: {
                    position: 'inside',
                    formatter: '{b}Expected: {c}%'
                }
            },
            {
                label: {
                    position: 'inside',
                    formatter: '{b}Actual: {c}%'
                }
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
            feature: {
                dataView: { readOnly: false },
                restore: {},
                saveAsImage: {}
            }
        }
    }
};
return getOption;`
};

const Multiple_funnel = {
    code: `const getOption = () => {
    return {
        type: 'funnel',
        data: {
            'Funnel 1': [
                { value: 60, name: 'APP' },
                { value: 40, name: 'PC' },
                { value: 20, name: 'Mobile' },
                { value: 80, name: 'Wechat' },
                { value: 100, name: 'Mini App' }
            ],
            'Funnel 2': [
                { value: 60, name: 'APP' },
                { value: 40, name: 'PC' },
                { value: 20, name: 'Mobile' },
                { value: 80, name: 'Wechat' },
                { value: 100, name: 'Mini App' }
            ],
        },
        width: ['35%','35%'],
        left: ['10%','55%'],
        sort: [ 'descending', 'ascending'],
        label: [
            {
                position: 'left',
            },
            {
                position: 'right',
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
            feature: {
                dataView: { readOnly: false },
                restore: {},
                saveAsImage: {}
            }
        }
    }
};
return getOption;`
};

const ex1 = new $visualify.LiveEditor(Basic_Funnel).mount('#ex1');
const ex2 = new $visualify.LiveEditor(Pyramid_Funnel).mount('#ex2');
const ex3 = new $visualify.LiveEditor(More_Funnel).mount('#ex3');
const ex4 = new $visualify.LiveEditor(Contrast_funnel).mount('#ex4');
const ex5 = new $visualify.LiveEditor(Multiple_funnel).mount('#ex5');
</script>

# Radar Chart

## Basic Radar Chart

<div id="ex1"></div>

## Pyramid Funnel Chart

<div id="ex2"></div>

## More Attribute for Funnel Chart

<div id="ex3"></div>

## Contrast Funnel Chart

<div id="ex4"></div>

## Multiple Funnel Chart

<div id="ex5"></div>

## Overall Configuration

### Basic Configuration

The basic configuration includes:

| Attribute       | Type        | Description             | Choice                     | Default |
| --------------- | ----------- | ----------------------- | -------------------------- | ------- |
| title           | string      | The main title          | User-defined title         | -       |
| subtitle        | string      | A secondary title       | User-defined subtitle      | -       |
| width           | string      | The width dimension     | Any valid CSS width value  | -       |
| height          | string      | The height dimension    | Any valid CSS height value | 400px   |
| legend          | bool/object | show or hide legend     | False, User-defined legend | {}      |
| xAxis           | array/false | The xAxis               | User-defined xAxis Data    | []      |
| yAxis           | array/false | The yAxis               | User-defined yAxis Data    | []      |
| label           | object      | The label               | User-defined label         | {}      |
| labelLine       | object      | The labelLine           | User-defined labelLine     | {}      |
| tooltip         | object      | The tooltip             | User-defined tooltip       | {}      |
| xAxisLineshow   | bool        | show or hide xAxisLines | True, False                | true    |
| yAxisLineshow   | bool        | show or hide yAxisLines | True, False                | true    |
| xAxisLabelShow  | bool        | show or hide xAxisLabel | True, False                | true    |
| yAxisLabelShow  | bool        | show or hide yAxisLabel | True, False                | true    |
| xAxisLabelColor | string      | The xAxisLabelColor     | Any valid CSS color value  | -       |
| yAxisLabelColor | string      | The yAxisLabelColor     | Any valid CSS color value  | -       |

### Data Configuration

| Attribute   | Type         | Description     | Choice                     | Default      |
| ----------- | ------------ | --------------- | -------------------------- | ------------ |
| data        | string       | The data        | User-defined data          | {}           |
| type        | string/array | The type        | 'line', 'bar'              | undefined    |
| sort        | string       | The sort        | 'ascending','descending'   | 'descending' |
| gap         | number       | The gap         | Any valid number           | 0            |
| funnelAlign | string       | The funnelAlign | 'left', 'right', 'center'  | 'center'     |
| max         | number       | The max         | Any valid number           | 0            |
| min         | number       | The min         | Any valid number           | 100          |
| width       | string       | The width       | Any valid CSS width value  | '80%'        |
| height      | string       | The height      | Any valid CSS height value | -            |
| top         | string       | The top         | Any valid CSS height value | 60           |
| bottom      | string       | The bottom      | Any valid CSS height value | 60           |
| left        | string       | The left        | Any valid CSS height value | 10%          |
| right       | string       | The right       | Any valid CSS height value | -            |
| label       | object       | The label       | User-defined label         | {}           |
| labelLine   | object       | The labelLine   | User-defined labelLine     | {}           |
| itemStyle   | object       | The itemStyle   | User-defined itemStyle     | {}           |
| emphasis    | object       | The emphasis    | User-defined emphasis      | {}           |
