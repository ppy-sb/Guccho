<script setup>
const user = inject('user')
</script>

<template>
  <div class="card">
    <!-- <div class="radial-progress mx-auto text-primary-content bg-primary/20 border-8 border-primary/20" style="--value:70; --size:12rem; --thickness: 0.66em;">
      <div class="text-3xl">
        Lv. 69
      </div>
    </div> -->

    <div class="card-body p-0 md:p-4 xl:p-3">
      <div class="stats bg-transparent drop-shadow-xl">
        <div class="stat">
          <div class="stat-title">
            Level
          </div>
          <div class="stat-value">
            69
          </div>
          <div class="stat-desc">
            <progress
              class="progress progress-primary"
              value="50"
              max="100"
            />
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            New Users
          </div>
          <div class="stat-value">
            4,200
          </div>
          <div class="stat-desc">
            ↗︎ 400 (22%)
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            New Registers
          </div>
          <div class="stat-value">
            1,200
          </div>
          <div class="stat-desc">
            ↘︎ 90 (14%)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
