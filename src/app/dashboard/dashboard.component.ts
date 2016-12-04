import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent,
  StatusFilter, RegionFilter, NotFilter, CompoundFilter } from '../shared/index';
import {nvD3} from 'ng2-nvd3'
declare let d3: any;

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css']
})
export class DashboardComponent extends TaggableViewerComponent implements OnInit {

  appStatusOptions = {
    chart: {
      type: 'pieChart',
      height: 300,
      donut: true,
      x: function(d){ return d.label;},
      y: function(d){ return d.value;},
      valueFormat: function(d){return d3.format('.0')(d);},
      showLabels: false,
      showLegend: false,
      cornerRadius: 5,
      padAngle: 0.05,
      title: 'Status',
      color: [ 'green', 'red' ]
    }
  };
  appStatusData = [];

  appSplitOptions = {
    chart: {
      type: 'sunburstChart',
      height: 300,
      color: d3.scale.category20c(),
      duration: 2500,
      mode: 'value'
    }
  };
  appSplitData = [];

  totalMemory = 0;

  constructor(public tagService: TagService, cd: ChangeDetectorRef) {
    super(tagService, cd);
  }

  ngOnInit(){
    this.computeData();
    super.ngOnInit();
  }

  onNewTaggables(taggables:Taggable[]) {
    this.computeData();
  }

  private computeData() {

    this.totalMemory = 0;
    this.getTaggableByType(Taggable.TYPE_APPLICATION).forEach(
      taggable => this.totalMemory += (taggable.target.entity.memory * taggable.target.entity.instances)
    );

    const upFilter = new StatusFilter('STARTED');
    const downFilter = new NotFilter(upFilter);

    const upCount = this.getTaggableByType(Taggable.TYPE_APPLICATION).filter((taggable) => upFilter.accept(taggable)).length;
    const downCount = this.getTaggableByType(Taggable.TYPE_APPLICATION).filter((taggable) => downFilter.accept(taggable)).length;
    const totalCount = upCount + downCount;

    this.appStatusOptions.chart.title = totalCount === 0 ? '' : (Math.floor(100 * upCount / totalCount) + '%');

    this.appStatusData = [
      {
        "label" : "UP",
        "value" : upCount
      } ,
      {
        "label" : "DOWN",
        "value" : downCount
      }
    ];

    const appSplitData = [
      {
        name: 'Apps',
        children: []
      }
    ];
    TagService.REGIONS.forEach(region => {
      const regionFilter = new RegionFilter(region);
      const regionNode = {
        name: region,
        children: [ {
          name: `Count (${region})`,
          children: [
            {
              name: `Up (${region})`,
              value: this.tagService.getFilteredTaggableByType(Taggable.TYPE_APPLICATION,
              new CompoundFilter([ regionFilter, upFilter ])).length
            },
            {
              name: `Down (${region})`,
              value: this.tagService.getFilteredTaggableByType(Taggable.TYPE_APPLICATION,
              new CompoundFilter([ regionFilter, downFilter ])).length
            }
          ]
        }]
      };
      appSplitData[0].children.push(regionNode);
    });
    this.appSplitData = appSplitData;
  }
}
