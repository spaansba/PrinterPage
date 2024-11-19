import React, { forwardRef, useEffect, useRef, useImperativeHandle, useState } from "react"

export type FacingMode = "user" | "environment"
export type AspectRatio = "cover" | number
export type Stream = MediaStream | null
export type SetStream = React.Dispatch<React.SetStateAction<Stream>>
export type SetNumberOfCameras = React.Dispatch<React.SetStateAction<number>>
export type SetNotSupported = React.Dispatch<React.SetStateAction<boolean>>
export type SetPermissionDenied = React.Dispatch<React.SetStateAction<boolean>>

export interface CameraProps {
  facingMode?: FacingMode
  aspectRatio?: AspectRatio
  numberOfCamerasCallback?(numberOfCameras: number): void
  videoSourceDeviceId?: string
  errorMessages: {
    noCameraAccessible?: string
    permissionDenied?: string
    switchCamera?: string
    canvas?: string
  }
  videoReadyCallback?(): void
}

export const Camera = forwardRef<unknown, CameraProps>(
  (
    {
      facingMode = "environment",
      aspectRatio = "cover",
      numberOfCamerasCallback = () => null,
      videoSourceDeviceId,
      errorMessages = {
        noCameraAccessible: "No camera device accessible",
        permissionDenied: "Permission denied. Please refresh and give camera permission.",
        switchCamera:
          "It is not possible to switch camera to different one because there is only one video device accessible.",
        canvas: "Canvas is not supported.",
      },
      videoReadyCallback = () => null,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<Stream>(null)
    const [numberOfCameras, setNumberOfCameras] = useState(0)
    const [currentFacingMode, setCurrentFacingMode] = useState<FacingMode>(facingMode)
    const [notSupported, setNotSupported] = useState(false)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const [torchSupported, setTorchSupported] = useState(false)
    const mounted = useRef(true)

    useEffect(() => {
      mounted.current = true
      return () => {
        mounted.current = false
      }
    }, [])

    useEffect(() => {
      numberOfCamerasCallback(numberOfCameras)
    }, [numberOfCameras])

    const initCameraStream = async (facingMode: FacingMode) => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      try {
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            deviceId: videoSourceDeviceId ? { exact: videoSourceDeviceId } : undefined,
            facingMode: facingMode,
          },
        }

        const newStream = await navigator.mediaDevices.getUserMedia(constraints)
        if (mounted.current) {
          setStream(newStream)
          if (videoRef.current) {
            videoRef.current.srcObject = newStream
          }

          // Check number of cameras
          const devices = await navigator.mediaDevices.enumerateDevices()
          const cameras = devices.filter((device) => device.kind === "videoinput")
          setNumberOfCameras(cameras.length)

          // Check torch support
          const track = newStream.getVideoTracks()[0]
          const capabilities = track.getCapabilities()
          setTorchSupported("torch" in capabilities)
        }
      } catch (err) {
        console.error("Camera error:", err)
        if ((err as Error).name === "NotAllowedError") {
          setPermissionDenied(true)
        } else {
          setNotSupported(true)
        }
      }
    }

    useEffect(() => {
      initCameraStream(currentFacingMode)
      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }, [currentFacingMode, videoSourceDeviceId])

    useImperativeHandle(ref, () => ({
      takePhoto: (type: "base64url" | "imgData" = "base64url") => {
        if (!videoRef.current || !canvasRef.current) {
          throw new Error(errorMessages.canvas)
        }

        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const context = canvas.getContext("2d")
        if (!context) throw new Error(errorMessages.canvas)

        context.drawImage(video, 0, 0)

        if (type === "imgData") {
          return context.getImageData(0, 0, canvas.width, canvas.height)
        }
        return canvas.toDataURL("image/jpeg")
      },

      switchCamera: () => {
        if (numberOfCameras <= 1) {
          throw new Error(errorMessages.switchCamera)
        }
        const newFacingMode = currentFacingMode === "user" ? "environment" : "user"
        setCurrentFacingMode(newFacingMode)
        return newFacingMode
      },

      getNumberOfCameras: () => numberOfCameras,

      toggleTorch: async () => {
        if (!stream || !torchSupported) return false
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()

        if ("torch" in capabilities) {
          const currentTorch = track.getConstraints()?.advanced?.[0]?.torch || false
          const newTorch = !currentTorch

          try {
            await track.applyConstraints({
              advanced: [{ torch: newTorch }],
            })
            return newTorch
          } catch (err) {
            console.error("Torch error:", err)
            return false
          }
        }
        return false
      },

      torchSupported,
    }))

    const aspectRatioStyle =
      aspectRatio === "cover"
        ? { objectFit: "cover" as const }
        : { aspectRatio: aspectRatio.toString() }

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {notSupported && <div className="error">{errorMessages.noCameraAccessible}</div>}
        {permissionDenied && <div className="error">{errorMessages.permissionDenied}</div>}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            ...aspectRatioStyle,
            transform: currentFacingMode === "user" ? "scaleX(-1)" : undefined,
          }}
          onLoadedData={() => videoReadyCallback()}
        />

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    )
  }
)

Camera.displayName = "Camera"
