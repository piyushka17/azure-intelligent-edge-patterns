import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { thunkAddCapturedImages } from "../../store/part/partActions";
import React from "react";
import { Button, PlayIcon, CallControlPresentNewIcon, PauseThickIcon, Image } from "@fluentui/react-northstar";

export const RTSPVideo = ({ selectedCamera, partId, canCapture }): JSX.Element => {
  const [streamId, setStreamId] = useState<string>('');
  const dispatch = useDispatch();

  const onCreateStream = (): void => {
    let url = `/api/streams/connect/?part_id=${partId}&rtsp=${selectedCamera.rtsp}`;
    if(!canCapture) url += '&inference=1';
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data?.status === 'ok') {
          setStreamId(data.stream_id);
        }
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onCapturePhoto = (): void => {
    dispatch(thunkAddCapturedImages(streamId));
  };

  const onDisconnect = useCallback((): void => {
    setStreamId('');
    fetch(`/api/streams/${streamId}/disconnect`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return null;
      })
      .catch((err) => {
        console.error(err);
      });
  }, [streamId]);

  useEffect(() => {
    window.addEventListener('beforeunload', onDisconnect);
    return (): void => {
      window.removeEventListener('beforeunload', onDisconnect);
    };
  }, [onDisconnect]);

  const src = streamId ? `/api/streams/${streamId}/video_feed` : '';

  return (
    <>
      <div style={{ width: '100%', height: '600px', backgroundColor: 'black' }}>
        {src ? <Image src={src} styles={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}
      </div>
      <Button.Group
        styles={{ alignSelf: 'center' }}
        buttons={[
          {
            key: 'start',
            icon: <PlayIcon />,
            iconOnly: true,
            onClick: onCreateStream,
            disabled: selectedCamera === null,
          },
          (canCapture && {
            key: 'capture',
            icon: <CallControlPresentNewIcon />,
            iconOnly: true,
            onClick: onCapturePhoto,
            disabled: !streamId,
          }),
          {
            key: 'stop',
            icon: <PauseThickIcon />,
            iconOnly: true,
            onClick: onDisconnect,
            disabled: !streamId,
          },
        ]}
      />
    </>
  );
};