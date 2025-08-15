```markdown
# 小球碰撞模拟器 (BallCollisionSimulator)

一个优雅的小球碰撞物理模拟库，可在浏览器中实现真实的小球碰撞效果，支持自定义物理参数和交互控制。

## 🚀 快速开始

### 直接体验

访问

### 基础用法

```javascript
// 获取canvas元素
const canvas = document.getElementById('simulator');

// 创建模拟器实例
const simulator = new BallCollisionSimulator(canvas, {
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffaa1d']
});

// 设置边界
simulator.setBoxBoundary(0, 0, canvas.width, canvas.height);

// 添加小球
simulator.addBall({ radius: 30, x: 100, y: 100, vx: 2, vy: 1 });
simulator.addBall({ radius: 20, x: 300, y: 200, vx: -1, vy: -2 });

// 开始模拟
simulator.start();
```

## 📚 API 文档

### 构造函数

```javascript
new BallCollisionSimulator(canvasElement, options)
```

#### 参数

| 参数名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `canvasElement` | `HTMLCanvasElement` | 是 | 用于渲染模拟的 canvas 元素 |
| `options` | `Object` | 否 | 模拟器配置选项 |

#### options 配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `colors` | `Array<string>` | `['#3498db', '#e74c3c', '#2ecc71', '#f39c12']` | 小球颜色数组，用于自动分配颜色 |
| `friction` | `number` | `0.99` | 摩擦系数（0-1之间，值越小摩擦越大） |
| `restitution` | `number` | `0.8` | 弹性系数（0-1之间，值越大弹性越好） |

### 核心方法

#### `addBall(config)`
添加一个新小球到模拟器

**参数：**
```javascript
{
  radius?: number,  // 半径（默认：20）
  mass?: number,    // 质量（默认：1）
  x?: number,       // x坐标（未指定则随机）
  y?: number,       // y坐标（未指定则随机）
  vx?: number,      // x轴速度（默认：0）
  vy?: number,      // y轴速度（默认：0）
  color?: string    // 颜色值（未指定则自动分配）
}
```

**返回：**  
`number` - 新添加小球的唯一ID

#### `removeBall(id)`
移除指定ID的小球

**参数：**  
`id: number` - 要移除的小球ID

#### `getBalls()`
获取所有小球的数组

**返回：**  
`Array<Ball>` - 当前所有小球的数组

#### `getBall(id)`
获取指定ID的小球

**参数：**  
`id: number` - 要获取的小球ID

**返回：**  
`Ball | undefined` - 对应的小球对象，未找到则返回undefined

#### `updateBall(id, updates)`
更新指定小球的属性

**参数：**
- `id: number` - 要更新的小球ID
- `updates: Object` - 包含要更新属性的对象

**示例：**
```javascript
updateBall(1, { radius: 30, color: '#ff0000', vx: 5 })
```

#### `clearBalls()`
清空模拟器中的所有小球

#### `reset()`
重置模拟器（清空所有小球并重绘画布）

#### `start()`
开始碰撞模拟

#### `stop()`
停止碰撞模拟

#### `setBoxBoundary(x, y, width, height)`
设置方框边界范围

**参数：**
- `x: number` - 边界左上角x坐标
- `y: number` - 边界左上角y坐标
- `width: number` - 边界宽度
- `height: number` - 边界高度

## 💡 高级示例

### 随机生成多个小球
```javascript
// 生成20个随机小球
for (let i = 0; i < 20; i++) {
  simulator.addBall({
    radius: Math.random() * 15 + 10,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4
  });
}
```

### 响应鼠标点击添加小球
```javascript
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  simulator.addBall({
    x,
    y,
    radius: Math.random() * 10 + 15,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3
  });
});
```