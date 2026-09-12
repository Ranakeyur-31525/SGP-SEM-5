import { useRobotStore } from '../stores/useRobotStore';

export interface MqttMessage {
  topic: string;
  payload: Record<string, any>;
  timestamp: string;
}

class MqttTelemetryService {
  private isConnected: boolean = false;
  private simulationInterval: any = null;
  private messageListeners: Array<(msg: MqttMessage) => void> = [];

  constructor() {
    this.startAutonomousSimulation();
  }

  public connect(brokerUrl = 'wss://broker.hivemq.com:8884/mqtt') {
    console.log(`[MQTT] Connecting to broker at ${brokerUrl}...`);
    this.isConnected = true;
  }

  public disconnect() {
    console.log('[MQTT] Disconnecting from broker.');
    this.isConnected = false;
  }

  public publish(topic: string, payload: Record<string, any>) {
    const msg: MqttMessage = {
      topic,
      payload,
      timestamp: new Date().toLocaleTimeString(),
    };
    console.log(`[MQTT PUBLISH] ${topic}:`, JSON.stringify(payload));
    this.notifyListeners(msg);
  }

  public subscribe(callback: (msg: MqttMessage) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(msg: MqttMessage) {
    this.messageListeners.forEach((listener) => listener(msg));
  }

  public startAutonomousSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      // Step simulation tick in Zustand robot store
      useRobotStore.getState().stepSimulationTick();

      const robot = useRobotStore.getState();
      
      // Periodically publish telemetry packets conforming to specification
      this.publish('medibot/nav/status', {
        floor: robot.currentFloor,
        junction: robot.currentJunction,
        targetBed: robot.targetBed,
        status: robot.status,
      });

      this.publish('medibot/safety/lidar', {
        distanceCm: robot.lidar.distanceCm,
        brakeEngaged: robot.lidar.brakeEngaged,
        signalQuality: robot.lidar.signalQuality,
      });
    }, 2500);
  }

  public stopAutonomousSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const mqttService = new MqttTelemetryService();
