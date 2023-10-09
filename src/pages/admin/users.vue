<script setup lang="ts">

</script>

<template>
  <div>
    <div class="join">
      <div>
        <div>
          <input class="input input-shadow input-bordered join-item" placeholder="Search">
        </div>
      </div>
      <select class="select select-bordered join-item">
        <option disabled selected>
          Filter
        </option>
        <option>Sci-fi</option>
        <option>Drama</option>
        <option>Action</option>
      </select>
      <div class="indicator">
        <span class="indicator-item badge badge-secondary">new</span>
        <button class="btn btn-shadow join-item">
          Search
        </button>
      </div>
    </div>
  </div>
  <div>
    <div class="overflow-x-auto">
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" class="checkbox">
              </label>
            </th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr>
            <th>
              <label>
                <input type="checkbox" class="checkbox">
              </label>
            </th>
            <td>
              <div class="flex items-center space-x-3">
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img src="/tailwind-css-component-profile-2@56w.png" alt="Avatar Tailwind CSS Component">
                  </div>
                </div>
                <div>
                  <div class="font-bold">
                    Hart Hagerty
                  </div>
                  <div class="text-sm opacity-50">
                    United States
                  </div>
                </div>
              </div>
            </td>
            <td>
              Zemlak, Daniel and Leannon
              <br>
              <span class="badge badge-ghost badge-sm">Desktop Support Technician</span>
            </td>
            <td>Purple</td>
            <th>
              <button class="btn btn-ghost btn-xs">
                details
              </button>
            </th>
          </tr>
        </tbody>
        <!-- foot -->
        <!-- <tfoot>
          <tr>
            <th />
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
            <th />
          </tr>
        </tfoot> -->
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>
