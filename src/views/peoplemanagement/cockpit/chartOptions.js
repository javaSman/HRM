const echarts = require('echarts')

const { graphic } = echarts

function baseTextStyle(fontSize = 12) {
  return {
    color: '#64748b',
    fontSize
  }
}

function baseAxisLine() {
  return {
    lineStyle: {
      color: 'rgba(37,99,235,0.12)'
    }
  }
}

function baseSplitLine() {
  return {
    lineStyle: {
      color: 'rgba(37,99,235,0.05)'
    }
  }
}

function tooltipStyle() {
  return {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: 'rgba(37,99,235,0.12)',
    textStyle: {
      color: '#0f172a'
    },
    extraCssText: 'box-shadow:0 8px 30px rgba(37,99,235,0.12);border-radius:10px;'
  }
}

function scaleNumber(value, ratio) {
  return Math.max(1, Math.round(value * ratio))
}

function scaleSeries(values, ratio) {
  return values.map(item => scaleNumber(item, ratio))
}

export function createOverviewChartOptions(source, colors, stats) {
  const ratio = stats.totalEmployees / 720

  return {
    parkDistribution: {
      tooltip: {
        trigger: 'item',
        ...tooltipStyle()
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            fontSize: 9,
            color: '#6b7c93'
          },
          data: source.parkDistribution.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: item.color
            }
          })),
          animationType: 'scale',
          animationDuration: 1200
        }
      ]
    },
    attendanceGauge: {
      series: [
        {
          type: 'gauge',
          radius: '80%',
          center: ['50%', '55%'],
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          progress: {
            show: true,
            width: 10,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: colors.blue },
                  { offset: 1, color: colors.cyan }
                ]
              }
            }
          },
          axisLine: {
            lineStyle: {
              width: 10,
              color: [[1, 'rgba(37,99,235,0.06)']]
            }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a',
            offsetCenter: [0, '60%']
          },
          data: [
            {
              value: stats.fullPunchRate,
              name: '综合出勤率'
            }
          ],
          title: {
            offsetCenter: [0, '85%'],
            fontSize: 9,
            color: '#64748b'
          }
        }
      ]
    },
    replenishOverview: {
      tooltip: {
        trigger: 'item',
        ...tooltipStyle()
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            fontSize: 9,
            color: '#6b7c93'
          },
          data: source.replenishOverview.map(item => ({
            value: scaleNumber(item.value, stats.replenishCount / 228),
            name: item.name,
            itemStyle: {
              color: item.color
            }
          })),
          animationType: 'scale',
          animationDuration: 1200
        }
      ]
    },
    ondutyTrend: {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle()
      },
      legend: {
        data: ['打卡率%', '打卡人数'],
        textStyle: baseTextStyle(11),
        top: 2,
        right: 10,
        itemWidth: 10,
        itemHeight: 8
      },
      grid: {
        left: 46,
        right: 46,
        top: 32,
        bottom: 28
      },
      xAxis: {
        type: 'category',
        data: source.ondutyTrend.days,
        axisLine: baseAxisLine(),
        axisLabel: {
          ...baseTextStyle(9),
          rotate: 30,
          interval: 2
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '打卡率%',
          min: 0,
          max: 100,
          axisLine: baseAxisLine(),
          axisLabel: baseTextStyle(10),
          splitLine: baseSplitLine(),
          nameTextStyle: baseTextStyle(10)
        },
        {
          type: 'value',
          name: '人数',
          axisLine: baseAxisLine(),
          axisLabel: baseTextStyle(10),
          splitLine: { show: false },
          nameTextStyle: baseTextStyle(10)
        }
      ],
      series: [
        {
          name: '打卡率%',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          data: source.ondutyTrend.rates,
          lineStyle: {
            color: colors.blue,
            width: 2
          },
          itemStyle: {
            color: colors.blue
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37,99,235,0.10)' },
              { offset: 1, color: 'rgba(37,99,235,0)' }
            ])
          },
          symbolSize: 4,
          animationDuration: 2000
        },
        {
          name: '打卡人数',
          type: 'bar',
          yAxisIndex: 1,
          data: scaleSeries(source.ondutyTrend.counts, ratio),
          barWidth: 7,
          itemStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(8,145,178,0.35)' },
              { offset: 1, color: 'rgba(8,145,178,0.04)' }
            ])
          },
          animationDuration: 2000
        }
      ]
    },
    replenishDept: {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle()
      },
      grid: {
        left: 100,
        right: 50,
        top: 10,
        bottom: 30
      },
      xAxis: {
        type: 'value',
        name: '次',
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle(),
        splitLine: baseSplitLine()
      },
      yAxis: {
        type: 'category',
        data: source.replenishDept.categories,
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle(10)
      },
      series: [
        {
          type: 'bar',
          data: source.replenishDept.values,
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color(params) {
              const list = [colors.blue, colors.cyan, colors.green, colors.warning, colors.orange, colors.purple, colors.teal, colors.slate]
              return list[params.dataIndex % list.length]
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#1e2d3d',
            fontSize: 11,
            fontWeight: 500,
            formatter: '{c}次'
          },
          animationDuration: 1500,
          animationDelay(index) {
            return index * 80
          }
        }
      ]
    },
    replenishReason: {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle()
      },
      legend: {
        data: ['补卡次数', '审批通过率'],
        textStyle: baseTextStyle(10),
        top: 2,
        right: 10,
        itemWidth: 10,
        itemHeight: 8
      },
      grid: {
        left: 46,
        right: 46,
        top: 36,
        bottom: 28
      },
      xAxis: {
        type: 'category',
        data: source.replenishReason.categories,
        axisLine: baseAxisLine(),
        axisLabel: {
          ...baseTextStyle(9),
          rotate: 25
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '次数',
          axisLine: baseAxisLine(),
          axisLabel: baseTextStyle(10),
          splitLine: baseSplitLine()
        },
        {
          type: 'value',
          name: '%',
          min: 0,
          max: 100,
          axisLine: baseAxisLine(),
          axisLabel: baseTextStyle(10),
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '补卡次数',
          type: 'bar',
          barWidth: 18,
          data: source.replenishReason.counts,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.blue },
              { offset: 1, color: 'rgba(37,99,235,0.15)' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 9,
            color: '#1e2d3d'
          },
          animationDuration: 1500
        },
        {
          name: '审批通过率',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: source.replenishReason.passRates,
          lineStyle: {
            color: colors.cyan,
            width: 2.5
          },
          itemStyle: {
            color: colors.cyan
          },
          symbolSize: 6,
          animationDuration: 1800
        }
      ]
    }
  }
}

export function createHumanCoreChartOptions(source, colors, stats) {
  const ratio = stats.totalEmployees / 720

  return {
    staffingCompare: {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle()
      },
      legend: {
        data: ['编制', '实际'],
        textStyle: baseTextStyle(),
        top: 2
      },
      grid: {
        left: 60,
        right: 20,
        top: 32,
        bottom: 30
      },
      xAxis: {
        type: 'category',
        data: source.staffingCompare.departments,
        axisLine: baseAxisLine(),
        axisLabel: {
          ...baseTextStyle(9),
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle(),
        splitLine: baseSplitLine()
      },
      series: [
        {
          name: '编制',
          type: 'bar',
          barWidth: 14,
          data: scaleSeries(source.staffingCompare.plan, ratio),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.blue },
              { offset: 1, color: 'rgba(37,99,235,0.15)' }
            ])
          },
          animationDuration: 1500
        },
        {
          name: '实际',
          type: 'bar',
          barWidth: 14,
          data: scaleSeries(source.staffingCompare.actual, ratio),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.cyan },
              { offset: 1, color: 'rgba(8,145,178,0.15)' }
            ])
          },
          animationDuration: 1800
        }
      ]
    },
    jobTypeDetail: {
      tooltip: {
        trigger: 'item',
        ...tooltipStyle()
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3
          },
          label: {
            fontSize: 10,
            color: '#6b7c93'
          },
          data: source.jobTypeDetail.map(item => ({
            value: scaleNumber(item.value, ratio),
            name: item.name,
            itemStyle: {
              color: item.color
            }
          })),
          animationType: 'scale',
          animationDuration: 1500
        }
      ]
    },
    turnoverTrend: {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle()
      },
      legend: {
        data: ['集团整体', '银星', '侨安', '皇基'],
        textStyle: baseTextStyle(),
        top: 2
      },
      grid: {
        left: 50,
        right: 20,
        top: 36,
        bottom: 30
      },
      xAxis: {
        type: 'category',
        data: source.turnoverTrend.months,
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle()
      },
      yAxis: {
        type: 'value',
        name: '离职率%',
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle(),
        splitLine: baseSplitLine()
      },
      series: [
        {
          name: '集团整体',
          type: 'line',
          smooth: true,
          data: source.turnoverTrend.group,
          lineStyle: { color: colors.blue, width: 3 },
          itemStyle: { color: colors.blue },
          symbolSize: 6,
          animationDuration: 2000
        },
        {
          name: '银星',
          type: 'line',
          smooth: true,
          data: source.turnoverTrend.yinhe,
          lineStyle: { color: colors.green, width: 2 },
          itemStyle: { color: colors.green },
          symbolSize: 4,
          animationDuration: 2000
        },
        {
          name: '侨安',
          type: 'line',
          smooth: true,
          data: source.turnoverTrend.qiaoan,
          lineStyle: { color: colors.warning, width: 2 },
          itemStyle: { color: colors.warning },
          symbolSize: 4,
          animationDuration: 2000
        },
        {
          name: '皇基',
          type: 'line',
          smooth: true,
          data: source.turnoverTrend.huangji,
          lineStyle: { color: colors.purple, width: 2 },
          itemStyle: { color: colors.purple },
          symbolSize: 4,
          animationDuration: 2000
        }
      ]
    },
    turnoverReason: {
      tooltip: {
        trigger: 'item',
        ...tooltipStyle()
      },
      legend: {
        bottom: 0,
        textStyle: baseTextStyle()
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['50%', '45%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3
          },
          label: {
            fontSize: 10,
            color: '#6b7c93'
          },
          data: source.turnoverReason.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: item.color
            }
          })),
          animationType: 'scale',
          animationDuration: 1500
        }
      ]
    }
  }
}

export function createAttendanceChartOptions(source, colors) {
  return {
    overtimeType: {
      tooltip: {
        trigger: 'item',
        ...tooltipStyle()
      },
      legend: {
        bottom: 0,
        textStyle: baseTextStyle()
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['50%', '45%'],
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3
          },
          label: {
            fontSize: 10,
            color: '#6b7c93'
          },
          data: source.overtimeType.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: item.color
            }
          })),
          animationType: 'scale',
          animationDuration: 1500
        }
      ]
    },
    deptOvertime: {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle()
      },
      grid: {
        left: 100,
        right: 50,
        top: 10,
        bottom: 30
      },
      xAxis: {
        type: 'value',
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle(),
        splitLine: baseSplitLine()
      },
      yAxis: {
        type: 'category',
        data: source.deptOvertime.departments.slice().reverse(),
        axisLine: baseAxisLine(),
        axisLabel: baseTextStyle()
      },
      series: [
        {
          type: 'bar',
          data: source.deptOvertime.hours.slice().reverse(),
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color(params) {
              const list = [colors.blue, colors.cyan, colors.green, colors.warning, colors.orange]
              return list[params.dataIndex % list.length]
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#1e2d3d',
            fontSize: 12,
            fontWeight: 500,
            formatter: '{c}h'
          },
          animationDuration: 1500,
          animationDelay(index) {
            return index * 80
          }
        }
      ]
    }
  }
}
