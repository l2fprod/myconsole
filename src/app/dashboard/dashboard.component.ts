import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TagService, Taggable, TaggableType, TaggableViewerComponent,
  StatusFilter, RegionFilter, NotFilter, CompoundFilter } from '../shared/index';
import {nvD3} from 'ng2-nvd3'
declare let d3: any;

@Component({
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css'],
  host: {
    'class': 'flex layout-column'
  }
})
export class DashboardComponent extends TaggableViewerComponent implements OnInit {

  appStatusOptions = {
    chart: {
      type: 'pieChart',
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
      color: d3.scale.category20c(),
      mode: 'value'
    }
  };
  appSplitData = [];

  stats = {
    memory: 0
  };

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
      const regionFilter = new RegionFilter(region.name);
      const regionNode = {
        name: region.display,
        children: [ {
          name: `Count (${region.display})`,
          children: [
            {
              name: `Up (${region.display})`,
              value: this.tagService.getFilteredTaggableByType(Taggable.TYPE_APPLICATION,
              new CompoundFilter([ regionFilter, upFilter ])).length
            },
            {
              name: `Down (${region.display})`,
              value: this.tagService.getFilteredTaggableByType(Taggable.TYPE_APPLICATION,
              new CompoundFilter([ regionFilter, downFilter ])).length
            }
          ]
        }]
      };
      appSplitData[0].children.push(regionNode);
    });
    this.appSplitData = appSplitData;

    this.stats = {
      memory: 0,
    };
    TagService.REGIONS.forEach(region => {
      this.stats[region.name] = {
        count: {},
        memory: {},
      };
      Taggable.TYPES.forEach(type => {
        this.stats[region.name].count[type.name] = this.tagService.getTaggablesMatching(`type:${type.name} region:${region.name}`).length;
      });

      let memoryInThisRegion = 0;
      this.tagService.getTaggablesMatching(`type:app region:${region.name}`).forEach(
        taggable => memoryInThisRegion += (taggable.target.entity.memory * taggable.target.entity.instances)
      );
      this.stats.memory += memoryInThisRegion;
      this.stats[region.name].memory = memoryInThisRegion;
    });

  }

}
