import { createReportAsync } from '@ohif/extension-default';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';
import OHIF, {  utils } from '@ohif/core';
import {  Types } from '@cornerstonejs/core';
import Enums from "@ohif/core"
import { StackViewportData, VolumeViewportData } from 'extensions/cornerstone/src/types/CornerstoneCacheService';




export default function PanelForm({
  servicesManager,
  commandsManager,
  extensionManager,
  configuration,
}) {

  console.log("HCB:IN PANEL FORM");
  const { segmentationService, viewportGridService, uiDialogService } = servicesManager.services;
  const [segmentations, setSegmentations] = useState(() => segmentationService.getSegmentations());

  if(segmentationService) {
    console.log("HCB:IN PANEL FORM : segmentationService");
    console.log(segmentationService);

    console.log("HCB:IN PANEL FORM : servicesManager.services.HangingProtocolService.activeStudy");
    console.log(servicesManager.services.HangingProtocolService.activeStudy)
  }

  if(viewportGridService){
    console.log("HCB:IN PANEL FORM : viewportGridService");
    console.log(viewportGridService);
  }

  if(commandsManager){
    console.log("HCB:IN PANEL FORM : commandsManager");
    console.log(commandsManager);
  }

  console.log("HCB: before useEffect");
  useEffect(() => {
    console.log("HCB: IN useEffect");
    const subscriptions = [];
    const _service = servicesManager.services;
    
    const {unscribeLoadEvent} = segmentationService.subscribe (segmentationService.EVENTS.SEGMENT_LOADING_COMPLETE, () => {
      console.log("HCB:EVENTS.SEGMENT_LOADING_COMPLETE"); 
    });
    subscriptions.push(unscribeLoadEvent);

    const {activeDisplaySet} = servicesManager.services.DisplaySetService.subscribe(servicesManager.services.DisplaySetService.EVENTS.DISPLAY_SETS_CHANGED, () => {
      console.log("HCB:EVENTS.DISPLAY_SETS_CHANGED: In Display set changed");
    });
    subscriptions.push(activeDisplaySet);

    // cornerstoneViewportService.EVENTS.VIEWPORT_DATA_CHANGED
    const EVENT_CS_DataChange = servicesManager.services.CornerstoneViewportService.EVENTS.VIEWPORT_DATA_CHANGED.toString();
    console.log("HCB:Event Name :"+ EVENT_CS_DataChange)
    // servicesManager.services.CornerstoneViewportService.EVENTS.VIEWPORT_DATA_CHANGED
    // EVENT Value : event::cornerstoneViewportService:viewportDataChanged
    const {cornerStoneViewport_DataChange} = servicesManager.services.CornerstoneViewportService.subscribe(EVENT_CS_DataChange, ({viewportData, viewportId}) => {
      console.log("HCB:"+ EVENT_CS_DataChange + "-> " + viewportId);
      console.log("HCB:"+ EVENT_CS_DataChange + "-> " + JSON.stringify(viewportData));

      const returnValue  = servicesManager.services.CornerstoneViewportService.getPresentation(viewportId);
      console.log("HCB:servicesManager.services.CornerstoneViewportService.getPresentation ->" + JSON.stringify(returnValue));
      
    });
    console.log("HCB:cornerStoneViewport_DataChange" + cornerStoneViewport_DataChange)
    subscriptions.push(cornerStoneViewport_DataChange);

    //View Grid Service state changed
    const {viewGridStateChangeUnSub } = _service.ViewportGridService.subscribe(_service.ViewportGridService.EVENTS.GRID_STATE_CHANGED,({state,viewports}) => {
        console.log("HCB: State changed for viewport :" + JSON.stringify(viewports));
    });
    subscriptions.push(viewGridStateChangeUnSub);

    //Cornerstone viewport index change data
    const {CornerstoneImageScrollbarIndexChanged} = _service.cornerstoneViewportService.subscribe(
      _service.cornerstoneViewportService.EVENTS.VIEWPORT_SLIDER_DATA_CHANGED, ({imageIndex,viewportData}) => {

        const activeViewPortId = viewportGridService.getActiveViewportId();
        console.log("HCB:service.cornerstoneViewportService Active View Port ID :" + activeViewPortId);

        //const _viewPortData = viewportData as StackViewportData | VolumeViewportData
        //console.log("HCB: PanelForm.cornerstoneViewportService.EVENTS.VIEWPORT_SLIDER_DATA_CHANGED -> "+ imageIndex );
        //console.log("HCB:viewportData:"+ JSON.stringify( _viewPortData.data.imageIds[imageIndex]));

        // Get the PRESENTATION from ViewPortID
        const returnValue   = servicesManager.services.CornerstoneViewportService.getCornerstoneViewport(activeViewPortId) as Types.IStackViewport | Types.IVolumeViewport | null;
        console.log("HCB:VIEWPORT_SLIDER_DATA_CHANGED:services.CornerstoneViewportService.getCornerstoneViewport -> " +  returnValue.getCurrentImageIdIndex());
      }
    );
    subscriptions.push(CornerstoneImageScrollbarIndexChanged);


    // ALL Subscription
    console.log("HCB: ALL Subscriptions")
    console.log(subscriptions)

    console.log("HCB: END useEffect");
    return () => {
      subscriptions.forEach(unsub => {
        unsub;
        console.log("HCB: UN-Subscribe");
      });
    };
    
  }, [segmentationService,servicesManager]);

  try {
    const activeIndexId = viewportGridService.getActiveViewportId();
    console.log("HCB:Active View Port ID" + activeIndexId);

    const viewPortPan = viewportGridService.getState();
    console.log("HCB:viewportGridService : " + viewPortPan);
    console.log(viewPortPan);

    console.log("HCB:servicesManager.services.DisplaySetService : " );
    console.log(servicesManager.services.DisplaySetService)

    


  } catch (error) {
    console.log("HCB:IN PANEL FORM ERROR : viewportGridService" +  error);
  }

  return (
    <>
      <div className="ohif-scrollbar flex min-h-0 flex-auto select-none flex-col justify-between overflow-auto">
        <div className="text-aqua-pale"><p> FORM TEST </p>
              ActiveViewPort Index :??
        </div>
      </div>
    </>
  );


}

PanelForm.propTypes = {
  commandsManager: PropTypes.shape({
    runCommand: PropTypes.func.isRequired,
  }),
  servicesManager: PropTypes.shape({
    services: PropTypes.shape({
      segmentationService: PropTypes.shape({
        getSegmentation: PropTypes.func.isRequired,
        getSegmentations: PropTypes.func.isRequired,
        toggleSegmentationVisibility: PropTypes.func.isRequired,
        subscribe: PropTypes.func.isRequired,
        EVENTS: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
